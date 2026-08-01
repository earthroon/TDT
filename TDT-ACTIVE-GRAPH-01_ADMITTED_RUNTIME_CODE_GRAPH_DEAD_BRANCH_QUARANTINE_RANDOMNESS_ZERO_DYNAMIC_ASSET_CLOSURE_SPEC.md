# TDT-ACTIVE-GRAPH-01

## Admitted Runtime Code Graph / Dead Branch Quarantine / Randomness Zero / Dynamic Asset Closure / Side-Effect Root Identity / Package Baseline Conservation Seal

- 문서 상태: `SPECIFICATION`
- 대상 기준본: `45_TDT_PROMOTION_BASELINE_00_CANONICAL_LOCK_DUAL_EMIT_PACKAGED_E2E_RELAUNCH_WORKER_RESTART_TEST_POINTER_SOURCE_BAKED_UNPROMOTED.zip`
- 선행 권위: `TDT-PROMOTION-BASELINE-00`
- 후속 인계: `TDT-GPU-DEVICE-SSOT-01`
- 최종 성공 상한: `ACTIVE_GRAPH_VERIFIED_UNPROMOTED`
- Production Pointer 변경: 금지

---

## 0. 목적

본 명세의 목적은 다듬다듬 런타임에서 실제 제품 동작에 참여하는 코드와 자산을 하나의 검증 가능한 그래프로 봉인하고, 다음 항목을 제품 경로에서 제거하거나 격리하는 것이다.

1. 호출되지 않는다고 추정될 뿐 실제 활성 가능성이 남은 휴면 코드
2. 빈 함수, 임시 구현, 미결 TODO와 placeholder
3. 출력 또는 작업 순서에 영향을 줄 수 있는 무작위성
4. 파일 시스템과 패키지에 존재하지만 권위 Manifest에 귀속되지 않은 동적 자산
5. 중복 이벤트 바인딩과 소유자 불명의 top-level 부작용
6. 존재하지 않는 셰이더·모듈·설정 파일을 지연 참조하는 경로
7. 전역 공개만으로 암묵적 실행 루트가 된 함수
8. 테스트 훅과 제품 훅 사이의 경계 오염

본 명세는 알고리즘을 재설계하지 않는다.

본 명세는 사용자의 보정 철학, ΔK/Q-map 계산식, EWA/Anisotropic 리샘플링, Blend-If, Q-wave, 색관리, 코덱 ABI를 바꾸는 명세가 아니다.

본 명세가 바꾸는 것은 다음 하나다.

> 어떤 코드가 실제 제품 경로이며, 어떤 코드가 제품 경로가 아닌지를 추측이 아니라 SSOT와 Receipt로 증명한다.

---

## 1. 현재 확정 상태

### 1.1 파일 단위 정적 입장표

현재 `generated-legacy-static-admission.json`은 다음 상태를 보고한다.

```text
fullLegacyFileCount=1171
recordCount=214
```

따라서 전체 `app/legacy-runtime`을 패키지에 무차별 복사하는 상태는 아니다.

파일 단위 Static Admission은 이미 존재하며, 1,171개 파일 중 214개만 방출 대상으로 선택된다.

그러나 이 입장표는 다음을 증명하지 못한다.

- 선택된 파일 안에서 어느 함수와 이벤트 경로가 실제 활성인지
- 전역으로 공개된 함수가 외부 문자열 조회로 호출되는지
- top-level event listener가 중복 등록되는지
- 동적 `fetch()`·`import()`·Worker·WASM 경로가 모두 정확한지
- 무작위 값이 출력 파라미터에 유입되는지
- 존재하지 않는 자산 참조가 사용자의 특정 조작에서만 폭발하는지

즉 현재 상태는 **File Closure는 존재하지만 Execution Closure는 없다.**

### 1.2 Legacy Root Script

`generated-legacy-manifest.json`에는 50개의 활성 Root Script가 존재한다.

그중 `app/legacy-runtime/main.js`는 단일 파일 안에 서로 다른 시대의 패치와 실행 루트를 함께 포함한다.

현재 확인된 대표 사례는 다음과 같다.

#### 빈 호출

```text
main.js:607  newFunction();
main.js:610  function newFunction() {
main.js:611    // TODO: Implement function logic or remove if not needed
```

이 코드는 top-level에서 실제 실행되지만 아무 일도 하지 않는다.

#### 무작위 자동튜닝

```text
main.js:1405  entropy: Math.random() * 100
main.js:2965  infoEntropy = Math.random() * 100
main.js:4612  entropy: Math.random() * 100
```

이 값은 품질·effort·큐 정렬·파라미터 선택에 연결될 수 있으므로 단순 진단용 난수가 아니다.

#### 무작위 Job ID

```text
main.js:2445  const id = Math.random().toString(36).slice(2)
```

Job ID가 픽셀 계산에 직접 쓰이지 않더라도, Worker 응답 귀속과 Receipt 순서를 비결정적으로 만든다.

#### 존재하지 않는 동적 자산

```text
main.js:3581  fetch('./basic.vert')
main.js:3582  fetch('./DeltaKWebGL-1.js')
```

현재 Static Admission에는 `DeltaKWebGL-1.js`가 포함되지 않는다.

주석 역시 실제 셰이더로 교체해야 한다고 명시한다.

#### 소유자 불명 호출

```text
main.js:3979  reactorDecideAndEvolve(imageData)
```

이 호출의 정의와 활성 소유권은 현재 Root Manifest에서 명확히 닫히지 않는다.

#### 중복 이벤트 바인딩

`DOMContentLoaded` 등록이 다수 존재하며, 동일한 `exportSpotPsdBtn`과 `preblurSlider` 바인딩 조각이 반복된다.

현재는 DOM 요소 부재, 조건 분기, 실행 순서에 의해 조용히 넘어갈 수 있지만, UI 구성 변경 시 동일 작업이 두 번 실행될 가능성이 남는다.

### 1.3 현재 Static Admission의 한계

현재 Static Admission은 literal edge를 따라 파일을 선택한다.

이 방식은 다음에는 강하다.

- Root Script에서 직접 참조되는 상대 경로
- 정적 import
- literal fetch
- 알려진 Worker·WASM 자산

그러나 다음에는 약하다.

- 문자열 결합으로 만들어지는 경로
- 전역 함수명 문자열 호출
- 이벤트 리스너 내부의 지연 실행
- 조건부로만 실행되는 top-level 등록
- 같은 파일 안의 active region과 historical region 분리
- 출력에 영향을 주는 시간·난수·환경값

따라서 후속 SSOT는 파일 입장표를 폐기하는 것이 아니라 그 위에 실행 그래프를 추가해야 한다.

---

## 2. 성공 상태와 상한

### 2.1 성공 상태

모든 Gate가 닫힌 경우 상태는 다음과 같다.

```text
ACTIVE_GRAPH_VERIFIED_UNPROMOTED
```

이 상태는 다음을 의미한다.

- 모든 제품 실행 Root가 선언돼 있다.
- 모든 실행 가능 Edge가 선언된 Node로 닫힌다.
- 모든 top-level 부작용의 소유자가 하나다.
- 활성 제품 그래프에서 무작위성 원천이 0개다.
- 모든 동적 자산이 ID·경로·digest·MIME·소유자에 귀속된다.
- Quarantine 자산은 빌드·라우트·Package에서 완전히 제외된다.
- 정리 전후 Packaged Baseline의 기능과 출력이 동일하다.
- Production Pointer는 바뀌지 않는다.

### 2.2 성공 상태가 의미하지 않는 것

다음 상태를 주장하지 않는다.

```text
PRODUCTION_PROMOTED
FULL_PRODUCT_RELEASED
GPU_DEVICE_UNIFIED
SURFACE_LIFECYCLE_CLOSED
WEBGPU_END_TO_END
ALL_LEGACY_CODE_REMOVED
ALL_OPTIONAL_FEATURES_PROMOTED
```

본 명세는 활성 경로의 정체성을 닫는다.

GPU Device 통합, Resource Disposal, Preview·Export Surface 통합은 후속 명세의 책임이다.

### 2.3 선행 Baseline이 아직 승격되지 않은 경우

`TDT-PROMOTION-BASELINE-00`의 실제 `PACKAGED_BASELINE_VERIFIED` Receipt가 없으면 본 명세의 Source Bake는 가능하지만 최종 PASS는 금지한다.

이때 상태는 다음으로 제한한다.

```text
SOURCE_BAKED_AWAITING_PACKAGED_BASELINE
```

명세 구현이 아무리 완전해도 기준 출력이 없는 상태에서 Behavioral Parity를 주장할 수 없다.

---

## 3. 비목표

본 명세에서 다음 변경은 금지한다.

- ΔK 계산식의 의미 변경
- Q-map 정규화 방식의 임의 변경
- 리샘플 커널 변경
- Blend-If 핸들·마스크 의미 변경
- 색공간, ICC, 감마 정책 변경
- Encoder 품질 기본값 변경
- 지원 포맷 증감
- PSD/PSB 지원 범위 확장
- Native Decoder 승격
- PSD Rust WASM 승격
- UI 레이아웃 개편
- Production Pointer 변경

임시 구현이 발견되더라도 올바른 알고리즘을 추측해 채우지 않는다.

정확한 기존 권위 구현을 찾지 못하면 해당 경로는 `QUARANTINED_UNRESOLVED`로 분리하고 기능 미지원 상태를 명시한다.

---

## 4. 규범 용어

- **MUST**: 반드시 충족해야 한다.
- **MUST NOT**: 절대로 허용하지 않는다.
- **SHOULD**: 특별한 근거가 없다면 충족해야 한다.
- **MAY**: 선택 가능하다.
- **Root**: 런타임이 직접 활성화할 수 있는 시작점.
- **Node**: 코드·Worker·WASM·Shader·Config·Asset 단위.
- **Edge**: 한 Node가 다른 Node를 활성화하거나 읽는 관계.
- **Side-Effect Root**: import 없이도 평가 시점에 이벤트·타이머·전역·IPC를 등록하는 실행점.
- **Quarantine**: 소스 보존은 하되 제품 빌드·라우트·패키지에서 완전히 제외된 상태.
- **Deterministic**: 같은 Canonical Input과 Toolchain에서 동일한 결과와 동일한 실행 귀속을 내는 상태.
- **Dynamic Asset**: `fetch`, dynamic import, Worker, WASM, URL, XHR, shader loader 등을 통해 런타임에 요청되는 자산.

---

# PART A. Active Graph SSOT

## 5. Graph Authority

### 5.1 단일 권위 Manifest

다음 파일을 Active Graph의 단일 권위로 둔다.

```text
app/src/runtime/active-graph/generated-active-runtime-graph.json
```

TypeScript 소비용 projection은 다음에 둔다.

```text
app/src/runtime/active-graph/generated-active-runtime-graph.ts
```

JSON이 SSOT이며 TypeScript 파일은 생성물이어야 한다.

수동 편집은 금지한다.

### 5.2 Manifest Schema

최소 Schema는 다음을 포함한다.

```ts
interface ActiveRuntimeGraphManifestV1 {
  schemaVersion: 1;
  patchId: 'TDT-ACTIVE-GRAPH-01';
  baselineReceiptDigest: string | null;
  sourceAuthorityDigest: string;
  roots: ActiveRootRecord[];
  nodes: ActiveNodeRecord[];
  edges: ActiveEdgeRecord[];
  sideEffects: SideEffectRecord[];
  quarantine: QuarantineRecord[];
  randomnessAuditDigest: string;
  dynamicAssetManifestDigest: string;
  graphDigest: string;
}
```

모든 배열은 정렬 기준을 고정해야 한다.

- Root: `rootId`
- Node: `nodeId`
- Edge: `fromNodeId`, `edgeKind`, `toNodeId`
- Side Effect: `ownerNodeId`, `sideEffectKind`, `sideEffectId`
- Quarantine: `sourceRelative`

### 5.3 Node 종류

허용 Node Kind는 다음으로 제한한다.

```text
classic-script
esm-module
worker-entry
worker-child
wasm-module
native-addon
shader-glsl
shader-wgsl
json-config
icc-profile
binary-asset
image-asset
stylesheet
html-inline-shader
runtime-generated-source
packaged-test-hook
```

알 수 없는 종류는 자동 `binary-asset`으로 폴백하지 않는다.

`E_ACTIVE_GRAPH_NODE_KIND_UNKNOWN`으로 실패한다.

### 5.4 Node 상태

각 Node는 정확히 하나의 상태를 가진다.

```text
ACTIVE_REQUIRED
ACTIVE_OPTIONAL
TEST_ONLY
QUARANTINED
ARCHIVE_ONLY
REJECTED_UNKNOWN
```

#### ACTIVE_REQUIRED

부팅 또는 기본 작업에 필수다.

누락 시 fail-closed한다.

#### ACTIVE_OPTIONAL

명시적 Capability와 연결된 선택 기능이다.

Capability 미사용 시 로드되지 않을 수 있지만, 사용하는 Fixture가 반드시 존재해야 한다.

#### TEST_ONLY

Packaged E2E Run Token과 Test Hook Gate가 있을 때만 활성화된다.

일반 사용자 런타임에서 접근하면 실패해야 한다.

#### QUARANTINED

소스 보존 대상이지만 제품 산출물에 포함되지 않는다.

#### ARCHIVE_ONLY

README, 패치 기록, 과거 분석 파일처럼 실행 의미가 없는 보존 자료다.

#### REJECTED_UNKNOWN

분류하지 못한 상태다.

이 상태가 하나라도 있으면 Build는 실패한다.

---

## 6. Root Authority

### 6.1 Root 종류

허용 Root는 다음과 같다.

```text
renderer-entry
legacy-root-script
worker-entry
child-worker-entry
packaged-e2e-entry
native-addon-entry
```

### 6.2 암묵적 Root 금지

다음은 Manifest에 명시되지 않으면 금지한다.

- `window.someFunction = ...`
- top-level function declaration으로 생성되는 전역 callable
- inline HTML handler에서 호출되는 함수
- `window[name]()` 형태로 검색되는 함수
- 문자열 기반 IPC handler name
- event listener callback
- timer callback
- MutationObserver callback
- requestAnimationFrame loop

전역 공개 함수는 “나중에 누군가 호출할 수도 있음”이므로 dead code가 아니다.

모든 전역 callable은 다음 중 하나여야 한다.

1. 명시적 Public Root
2. 명시적 Compatibility Facade
3. Quarantine

### 6.3 기존 Legacy Manifest와 관계

`generated-legacy-manifest.json`의 50개 Root는 입력 자료로 사용한다.

그러나 본 명세 통과 후 실행 권위는 `generated-active-runtime-graph.json`이 소유한다.

기존 Manifest는 다음 역할로 축소한다.

- Classic Script load order projection
- declared global write projection
- compatibility diagnostics

두 Manifest가 충돌하면 Active Runtime Graph가 우선한다.

단, 기존 load order를 바꾸려면 Behavioral Parity Gate를 통과해야 한다.

---

## 7. Edge Authority

### 7.1 허용 Edge Kind

```text
static-import
literal-dynamic-import
manifest-script-load
worker-spawn
child-worker-spawn
wasm-load
native-addon-load
fetch-asset
shader-load
config-load
stylesheet-load
html-inline-reference
global-call
ipc-call
event-callback
timer-callback
observer-callback
compatibility-facade
```

### 7.2 Literal Closure

제품 그래프에서 다음은 literal 또는 Registry ID로만 허용한다.

- dynamic import
- Worker URL
- Child Worker URL
- WASM URL
- Shader URL
- Config URL
- ICC URL
- Runtime fetch URL

다음 형태는 금지한다.

```js
fetch(base + name + '.glsl')
import(`./${moduleName}.js`)
new Worker(prefix + workerFile)
window[handlerName](payload)
```

예외는 Registry가 정확한 ID를 받아 고정된 route를 반환하는 경우뿐이다.

### 7.3 Dynamic Expression 금지

정적 분석기가 대상 Node를 하나로 결정하지 못하면 다음 실패 코드를 낸다.

```text
E_ACTIVE_GRAPH_DYNAMIC_EXPRESSION_UNRESOLVED
```

“아마 이 파일일 것”이라는 추론 폴백은 금지한다.

### 7.4 Cycle

Cycle 자체는 금지하지 않는다.

그러나 다음 Cycle은 금지한다.

- 부팅 시 재진입을 만드는 Cycle
- Worker가 자신을 Child Worker로 다시 생성하는 Cycle
- Asset Registry 초기화 전에 Registry를 호출하는 Cycle
- 이벤트 바인더가 재평가될 때 listener 수가 증가하는 Cycle

Cycle은 SCC 단위로 Receipt에 기록한다.

---

# PART B. Monolithic Legacy Main Decomposition

## 8. `main.js` 처리 원칙

### 8.1 파일 전체 삭제 금지

현재 `main.js`에는 실제 제품 기능과 불완전한 패치가 섞여 있다.

따라서 파일 전체를 dead code로 판단하거나 통째로 제거해서는 안 된다.

### 8.2 원본 보존

정리 전 원본은 다음 위치에 content-addressed archive로 보존한다.

```text
archive/legacy-quarantine/TDT-ACTIVE-GRAPH-01/main.<sha256>.js
```

Archive는 다음을 만족해야 한다.

- 원본 SHA-256 보존
- 원본 byte length 보존
- 원래 경로 기록
- Quarantine 이유 기록
- Package 미포함
- Static Route 미노출

### 8.3 추출 단위

`main.js`를 정리할 때 최소 다음 책임으로 분리한다.

```text
legacy-main-entry.js
icms-auto-binding.js
legacy-filter-worker-bridge.js
legacy-delta-k-controls.js
legacy-batch-queue.js
legacy-spot-psd-binding.js
legacy-ash-qmap-binding.js
legacy-export-binding.js
```

이 이름은 권장안이며 실제 기존 함수 관계에 따라 더 세분화할 수 있다.

중요한 조건은 파일 수가 아니라 책임 소유권이다.

### 8.4 Classic Script 의미 보존

기존 코드가 Classic Script의 전역 선언 의미에 의존하면 무리하게 ESM으로 변환하지 않는다.

각 추출 모듈은 다음 중 하나를 선택한다.

1. Classic Script + Manifest order
2. IIFE + 명시적 Compatibility Facade
3. ESM + 명시적 export/import

혼합 사용은 가능하지만 전역 소유권을 Receipt로 증명해야 한다.

### 8.5 추출 중 알고리즘 수정 금지

활성 코드 추출은 byte-for-byte 함수 본문 보존을 기본으로 한다.

다음 변경은 허용한다.

- 이름 충돌 해소
- 명시적 import/export 또는 facade 연결
- Listener ownership wrapper 적용
- Asset Registry ID 적용
- Randomness 제거
- placeholder 격리

계산식 자체 변경은 별도 명세 없이 금지한다.

---

## 9. Quarantine 판정

### 9.1 Quarantine 후보

다음은 현재 확인된 Quarantine 후보이며, Bake 시 정적·동적 증거로 최종 판정한다.

- top-level 빈 `newFunction()` 호출
- `newFunction_placeholder()`
- 실제 측정 없이 `Math.random()`을 entropy로 쓰는 임시 분석기
- 존재하지 않는 `DeltaKWebGL-1.js`를 읽는 렌더 경로
- 소유권이 닫히지 않은 `reactorDecideAndEvolve()` 경로
- 중복 `exportSpotPsdBtn` 바인더
- 중복 `preblurSlider` 바인더
- 정의되지 않은 지역 변수에 의존하는 비교 helper
- 주석상 “나중에 구현”인 사용자 조작 경로

후보라는 이유만으로 자동 삭제하지 않는다.

각 항목은 다음 중 하나의 증거가 필요하다.

```text
ACTIVE_PROVEN
QUARANTINE_PROVEN
UNRESOLVED_FAIL
```

### 9.2 Active Proven

다음 중 하나를 만족해야 한다.

- Canonical Fixture에서 실행됨
- UI Element와 Event Ownership이 명확함
- 다른 Active Node의 정적 호출 Edge가 있음
- Public Compatibility Contract에 등록됨
- Export/Preview Receipt에 실행 증거가 남음

### 9.3 Quarantine Proven

다음을 모두 만족해야 한다.

- Active Root에서 도달 불가
- 전역 callable로 공개되지 않음
- Event/Timer/Observer 등록 없음
- Dynamic name lookup 대상이 아님
- Package Baseline 시나리오에서 미실행
- 제거 후 Behavioral Parity 유지

### 9.4 판단 불가

판단 불가 코드는 제품 그래프에 남겨 두지 않는다.

다음 상태로 둔다.

```text
QUARANTINED_UNRESOLVED
```

그리고 Capability Manifest에 미지원 또는 미승격으로 기록한다.

조용히 no-op로 대체하는 것은 금지한다.

---

# PART C. Side-Effect Root Identity

## 10. Side Effect 종류

다음 top-level 또는 activation-time 동작은 모두 Side Effect로 등록한다.

```text
dom-event-listener
window-event-listener
worker-message-listener
ipc-listener
timer-interval
timer-timeout
animation-frame-loop
mutation-observer
resize-observer
global-publication
custom-event-dispatch
service-registration
asset-prefetch
```

## 11. Side Effect Record

```ts
interface SideEffectRecord {
  sideEffectId: string;
  ownerNodeId: string;
  sideEffectKind: string;
  targetIdentity: string;
  eventType: string | null;
  callbackIdentity: string;
  activationPhase: string;
  cardinality: 'exactly-one' | 'zero-or-one' | 'many-bounded';
  disposerIdentity: string | null;
}
```

### 11.1 Listener Identity

DOM Listener의 `sideEffectId`는 최소 다음을 포함한다.

```text
ownerNodeId + targetIdentity + eventType + purposeId
```

예시:

```text
dadum.legacy.spot-psd-binding#exportSpotPsdBtn#click#export-spot-psd
```

### 11.2 중복 등록 금지

`cardinality=exactly-one`인 Side Effect가 동일 Runtime Epoch에서 두 번 등록되면 실패한다.

```text
E_ACTIVE_GRAPH_SIDE_EFFECT_DUPLICATE
```

중복 등록을 “동일 콜백이므로 괜찮음”으로 처리하지 않는다.

### 11.3 Idempotent Binder

UI Binder는 다음 계약을 가져야 한다.

```ts
bind(): BindingReceipt
dispose(): void
isBound(): boolean
```

익명 `DOMContentLoaded` 블록을 계속 추가하는 방식은 금지한다.

### 11.4 Runtime Epoch

Side Effect는 현재 Runtime Epoch에 귀속한다.

Relaunch, Worker Restart, View remount 후 이전 Epoch의 Listener가 남아 있으면 실패한다.

---

# PART D. Randomness Zero

## 12. 금지 Entropy Source

활성 제품 그래프에서 다음 API 사용은 0개여야 한다.

```text
Math.random
crypto.getRandomValues
crypto.randomUUID
Date.now used as algorithm input
performance.now used as algorithm input
unseeded PRNG
GPU timestamp used as algorithm input
process.hrtime used as algorithm input
```

Telemetry 기록 자체는 허용한다.

그러나 관측 시간값이 다음에 영향을 주면 금지한다.

- 픽셀 값
- Q-map
- Encoder parameter
- 작업 순서
- 포맷 선택
- Worker routing
- Retry 결과
- Receipt canonical identity

## 13. Job ID 대체

`Math.random()` 기반 Job ID는 다음 SSOT로 교체한다.

```text
runtimeEpochId + workerGeneration + monotonicJobSequence
```

예시:

```text
r3-g2-j00000042
```

Sequence는 단일 Service가 소유한다.

각 Worker 또는 함수가 자체 counter를 만들지 않는다.

## 14. Entropy 분석 대체

실제 entropy metric이 구현돼 있지 않은 경로는 다음 중 하나로 처리한다.

1. 이미 존재하는 권위 metric에 연결
2. 해당 자동튜닝을 비활성 Capability로 격리
3. 명시적 고정 기본값 사용

무작위 값을 “임시 entropy”로 사용하는 것은 금지한다.

고정 기본값을 사용할 경우 Receipt에 다음을 기록한다.

```text
parameterSource=canonical-default
analysisUnavailable=true
```

실제 분석을 수행한 척해서는 안 된다.

## 15. Seeded Test PRNG

테스트에서 난수가 필요한 경우 다음 조건으로만 허용한다.

- `TEST_ONLY` Node
- 명시적 seed
- seed가 Fixture Manifest에 기록됨
- Production Graph에서 해당 Node 미포함

제품 코드와 같은 파일 안에 Test PRNG를 두지 않는다.

## 16. Randomness Audit

정적 스캔은 최소 다음 파일을 검사한다.

- Active JS/TS/MJS/CJS
- Worker Entry와 Child Worker
- Electron Main/Preload
- Runtime-generated code template
- Inline HTML Script

결과 Manifest:

```text
artifacts/active-graph-01/TDT_ACTIVE_GRAPH_01_RANDOMNESS_AUDIT.json
```

최종 PASS 조건:

```text
activeRandomnessSourceCount=0
activeTimeInputSourceCount=0
testOnlySeededSourceCount>=0
unclassifiedSourceCount=0
```

---

# PART E. Dynamic Asset Closure

## 17. Asset Authority

다음 파일을 Dynamic Asset SSOT로 둔다.

```text
app/src/runtime/assets/generated-runtime-asset-manifest.json
```

### 17.1 Asset Record

```ts
interface RuntimeAssetRecord {
  assetId: string;
  ownerNodeId: string;
  assetKind: string;
  sourceRelative: string;
  emittedRoute: string;
  sourceSha256: string;
  emittedSha256: string | null;
  byteLength: number;
  mime: string;
  requiredState: 'required' | 'optional' | 'test-only';
  capabilityId: string | null;
}
```

### 17.2 경로 직접 사용 금지

활성 제품 코드에서 자산을 경로 문자열로 직접 요청하는 것을 금지한다.

다음 API를 사용한다.

```ts
resolveAssetUrl(assetId: RuntimeAssetId): string
fetchAssetExact(assetId: RuntimeAssetId): Promise<ArrayBuffer>
fetchAssetTextExact(assetId: RuntimeAssetId): Promise<string>
```

Worker와 dynamic import는 Vite URL Authority를 유지하되, 생성 Manifest에 ID와 digest를 기록한다.

### 17.3 Shader

모든 Shader는 다음 중 하나여야 한다.

1. source file asset
2. generated embedded source
3. HTML inline shader

각 Shader는 source digest를 가진다.

Fallback shader를 문자열로 조용히 삽입하는 경우 별도 Node로 등록해야 한다.

Fallback이 원래 알고리즘을 대체한다면 fail-open이므로 금지한다.

### 17.4 존재하지 않는 Asset

`DeltaKWebGL-1.js`처럼 실제 자산이 없는 경로는 다음 중 하나로 처리한다.

- 정확한 권위 Shader로 연결
- 해당 호출 경로 Quarantine

빈 Shader, passthrough Shader, 다른 파일 추정 연결은 금지한다.

## 18. Runtime Observation

Packaged Runtime의 Static COI Server는 모든 route 요청을 append-only로 기록한다.

관측 대상:

- renderer chunk
- legacy script
- worker
- child worker
- wasm
- shader
- json config
- icc
- image asset
- native addon

각 요청은 다음을 기록한다.

```text
runtimeEpoch
requestSequence
route
mime
servedSha256
ownerAssetId
scenarioId
```

### 18.1 관측 Closure

다음 관계가 성립해야 한다.

```text
Observed Runtime Asset Set ⊆ Admitted Asset Set
```

관측됐지만 입장표에 없는 자산이 하나라도 있으면 실패한다.

### 18.2 Admitted but Unobserved

`ACTIVE_REQUIRED` 자산은 Canonical Scenario에서 반드시 한 번 이상 관측돼야 한다.

`ACTIVE_OPTIONAL` 자산은 해당 Capability Scenario에서 관측돼야 한다.

관측 시나리오가 없는 Optional Asset은 허용하지 않는다.

```text
E_ACTIVE_GRAPH_OPTIONAL_ASSET_NO_SCENARIO
```

### 18.3 Network Zero

Packaged Baseline에서 외부 HTTP(S) 요청은 0개여야 한다.

허용 대상은 Electron 내부 Static COI origin뿐이다.

외부 요청 시 즉시 실패한다.

---

# PART F. Quarantine Closure

## 19. Quarantine 위치

Quarantine은 `app/` 아래에 두지 않는다.

권장 위치:

```text
archive/legacy-quarantine/TDT-ACTIVE-GRAPH-01/
```

`public/`, `dist/`, `resources/`, `extraResources` 하위에 포함해서는 안 된다.

## 20. Quarantine Receipt

각 파일 또는 Region은 다음을 기록한다.

```ts
interface QuarantineRecord {
  quarantineId: string;
  originalPath: string;
  archivePath: string;
  originalSha256: string;
  archivedSha256: string;
  byteLength: number;
  reasonCode: string;
  evidenceIds: string[];
  replacementNodeIds: string[];
  behaviorParityScenarioIds: string[];
}
```

원본과 Archive SHA가 다르면 실패한다.

## 21. Package Exclusion

다음 Manifest 어디에도 Quarantine 경로가 나타나면 안 된다.

- Vite Entry Graph
- Emitted Artifact Manifest
- Legacy Static Admission
- Static Route Manifest
- Package Content Manifest
- Electron extraResources
- Runtime Asset Manifest

Package에서 archive 문자열이나 byte signature가 검출되면 실패한다.

## 22. 삭제와 보존

Git 저장소에서 과거 코드를 완전히 삭제하는 것은 본 명세의 필수 조건이 아니다.

필수 조건은 제품 산출물과 실행 그래프에서 분리되는 것이다.

Archive 보존 기간과 최종 삭제는 사용자 승인 대상이다.

---

# PART G. Behavioral Baseline Conservation

## 23. 선행 Baseline

입력은 `TDT-PROMOTION-BASELINE-00`의 다음 증거를 사용한다.

- Canonical Input Digest
- Package Content ID
- Packaged Runtime API Digest
- Cross-format Save Smoke outputs
- Worker Restart Receipt
- Relaunch Receipt
- Test Pointer Recovery Receipt

## 24. 정리 전 Snapshot

정리 전 Packaged Candidate에서 다음을 캡처한다.

- Boot capability set
- Legacy activation result 50개
- Side Effect count by owner
- Runtime requested asset set
- Cross-format output SHA
- Worker generation transitions
- Export Receipt canonical JSON
- Preview final-surface revision sequence
- Stable error set

## 25. 정리 후 비교

### 25.1 Exact 항목

다음은 exact match가 필요하다.

- Canonical Fixture output bytes
- Encoder identity
- Worker protocol version
- Surface revision sequence
- Atomic save output digest
- Supported capability set
- Stable error code
- External network request count 0

### 25.2 구조적 항목

다음은 구조적으로 동일해야 한다.

- Boot state transition
- Worker restart semantics
- Relaunch semantics
- Test Pointer recovery semantics
- User-visible control availability

### 25.3 허용 차이

다음 차이는 허용한다.

- Package Content ID 변경
- Source Graph Digest 변경
- active file count 감소 또는 책임 분리로 인한 증가
- Quarantine byte count 증가
- 진단 로그 순서의 비본질적 변화
- 부팅 시간 개선

단, 허용 차이도 Receipt에 기록한다.

## 26. 미관측 기능

Baseline Fixture가 특정 기능을 실행하지 않는 경우 해당 기능을 보존했다고 주장할 수 없다.

다음 중 하나가 필요하다.

- 전용 Fixture 추가
- Capability를 Optional Unpromoted로 내림
- 판단 불가로 Quarantine

“사용자가 거의 안 쓰므로 유지됐을 것”이라는 추정은 금지한다.

---

# PART H. Source and Runtime Gates

## 27. Source Gate

Source Gate는 최소 다음을 검사한다.

1. Graph Manifest schema와 self-digest
2. 모든 Root의 Node 존재
3. 모든 Edge의 from/to 존재
4. `REJECTED_UNKNOWN` 0개
5. 동적 표현 0개
6. 제품 그래프 무작위성 0개
7. Side Effect 소유권 누락 0개
8. `exactly-one` 중복 후보 0개
9. Quarantine route 노출 0개
10. Dynamic Asset digest 누락 0개
11. 존재하지 않는 literal asset 0개
12. 외부 URL literal 0개
13. Runtime-generated source의 source template digest 존재
14. Test Hook의 packaged run-token guard 존재
15. Production Pointer mutation code 부재

## 28. Static Reachability Gate

### 28.1 AST 분석

JavaScript/TypeScript 분석은 comment·string grep만으로 끝내지 않는다.

AST 기반으로 최소 다음을 추출한다.

- import declaration
- import expression
- call expression
- new Worker
- fetch/XHR
- WebAssembly loader
- event listener registration
- timer registration
- global assignment
- computed global lookup
- function declaration and exposure

### 28.2 Classic Script

Classic Script는 ESM보다 전역 의미가 넓다.

따라서 top-level `var`, function declaration, bare assignment를 모두 global publication 후보로 간주한다.

### 28.3 Unknown Computed Access

다음처럼 target을 확정할 수 없는 전역 호출은 실패한다.

```js
window[name](...args)
globalThis[prefix + suffix]
```

Registry Lookup으로 치환하거나 Quarantine해야 한다.

## 29. Dynamic Runtime Gate

Packaged Candidate에서 Scenario Matrix를 실행한다.

최소 Scenario:

```text
boot-clean
load-rgba8-fixture
load-rgba16-fixture
preview-render
export-png8
export-png16
export-webp-lossless
export-jpeg-444
export-jxl
export-psd-rgb8
export-psd-rgb16
worker-forced-crash-restart
relaunch-open
isolated-test-pointer-recovery
```

지원 광고가 있는 기능은 Matrix에 포함돼야 한다.

## 30. Side Effect Runtime Gate

각 Scenario 종료 시 다음이 0이어야 한다.

```text
unexpectedListenerCount
orphanTimerCount
orphanAnimationFrameCount
orphanObserverCount
unknownGlobalPublicationCount
staleEpochCallbackCount
```

## 31. Graph Shrink Gate

본 명세의 목적은 무조건 파일 수를 줄이는 것이 아니다.

따라서 단순 `nodeCount` 감소를 PASS 조건으로 쓰지 않는다.

대신 다음을 요구한다.

```text
unclassifiedExecutableRegionCount=0
randomnessSourceCount=0
unresolvedDynamicAssetCount=0
duplicateSideEffectCount=0
quarantinedExecutableByteCount>0
```

확인된 결함이 하나도 격리되지 않았다면 명세 목적을 달성하지 못한 것이다.

## 32. Mutation Zero

Gate 실행 중 다음은 변하면 안 된다.

- Source outside generated manifests and artifact directories
- Production Pointer
- 사용자 Export Directory
- Canonical Fixture
- 기존 Codec ABI

Generator가 변경할 수 있는 경로는 명시적으로 allowlist한다.

---

# PART I. Runtime Services

## 33. ActiveGraphService

신규 Runtime Service를 둔다.

```ts
interface ActiveGraphService {
  initialize(): Promise<void>;
  assertRoot(rootId: string): void;
  assertNode(nodeId: string): void;
  recordActivation(nodeId: string): void;
  recordSideEffect(sideEffectId: string): void;
  recordAssetRequest(assetId: string, route: string): void;
  snapshot(): ActiveGraphRuntimeReceipt;
}
```

이 Service는 알고리즘 실행을 소유하지 않는다.

실행 귀속과 증거만 소유한다.

## 34. RuntimeAssetAuthority

```ts
interface RuntimeAssetAuthority {
  resolve(assetId: string): URL;
  fetchBytes(assetId: string): Promise<ArrayBuffer>;
  fetchText(assetId: string): Promise<string>;
  attest(assetId: string, bytes: ArrayBuffer): Promise<AssetAttestation>;
}
```

### 34.1 Digest 검증

Shader, JSON, ICC, WASM처럼 exact source가 필요한 자산은 사용 전에 digest를 검증한다.

Vite chunk처럼 emit 시 이름이 바뀌는 자산은 emitted manifest digest를 검증한다.

### 34.2 Main-thread Encoding과 무관

Asset Authority는 Encoder 실행 위치를 바꾸지 않는다.

기존 Worker-only 계약은 유지한다.

## 35. SideEffectRegistry

```ts
interface SideEffectRegistry {
  bind(record: SideEffectBinding): SideEffectLease;
  assertCardinality(): void;
  disposeEpoch(epochId: string): void;
  snapshot(): SideEffectReceipt;
}
```

Listener 직접 등록을 완전히 금지할 필요는 없으나, 등록 전에 Registry에 귀속돼야 한다.

## 36. DeterministicSequenceService

```ts
interface DeterministicSequenceService {
  next(scopeId: string): number;
  formatJobId(scopeId: string, workerGeneration: number): string;
  snapshot(): SequenceReceipt;
}
```

Job ID, request ID, local operation sequence를 이 Service가 소유한다.

시간과 난수를 사용하지 않는다.

---

# PART J. Artifact and Receipt

## 37. Artifact Directory

```text
artifacts/active-graph-01/<run-id>/
```

최소 구조:

```text
input/
  baseline-admission.json
  source-authority.json
source/
  active-runtime-graph.json
  randomness-audit.json
  side-effect-manifest.json
  dynamic-asset-manifest.json
  quarantine-manifest.json
runtime/
  observed-activation-trace.jsonl
  observed-asset-trace.jsonl
  side-effect-runtime-receipt.json
  scenario-matrix-receipt.json
parity/
  before-snapshot.json
  after-snapshot.json
  behavioral-parity-receipt.json
package/
  quarantine-exclusion-receipt.json
  external-network-zero-receipt.json
final/
  TDT_ACTIVE_GRAPH_01_FINAL_RECEIPT.json
failures/
  <failure-id>.json
```

## 38. Append-only

Runtime trace와 failure evidence는 append-only다.

성공 시 실패 파일을 삭제하거나 덮어쓰지 않는다.

Run ID로 분리한다.

## 39. Final Receipt Schema

```ts
interface ActiveGraphFinalReceiptV1 {
  schemaVersion: 1;
  patchId: 'TDT-ACTIVE-GRAPH-01';
  state: 'ACTIVE_GRAPH_VERIFIED_UNPROMOTED';
  baselineReceiptDigest: string;
  sourceAuthorityDigest: string;
  activeGraphDigest: string;
  dynamicAssetManifestDigest: string;
  sideEffectManifestDigest: string;
  quarantineManifestDigest: string;
  randomnessAuditDigest: string;
  behavioralParityReceiptDigest: string;
  packageExclusionReceiptDigest: string;
  activeRootCount: number;
  activeNodeCount: number;
  activeEdgeCount: number;
  activeRandomnessSourceCount: 0;
  unresolvedDynamicAssetCount: 0;
  duplicateSideEffectCount: 0;
  unclassifiedExecutableRegionCount: 0;
  quarantinedExecutableByteCount: number;
  externalNetworkRequestCount: 0;
  productionPointerMutation: false;
  finalPromotionPassIssued: false;
  selfDigest: string;
}
```

---

# PART K. 실패 코드

## 40. Baseline

```text
E_ACTIVE_GRAPH_BASELINE_RECEIPT_MISSING
E_ACTIVE_GRAPH_BASELINE_RECEIPT_INVALID
E_ACTIVE_GRAPH_BASELINE_STATE_INSUFFICIENT
E_ACTIVE_GRAPH_SOURCE_AUTHORITY_DRIFT
```

## 41. Graph

```text
E_ACTIVE_GRAPH_ROOT_UNDECLARED
E_ACTIVE_GRAPH_NODE_UNDECLARED
E_ACTIVE_GRAPH_NODE_KIND_UNKNOWN
E_ACTIVE_GRAPH_NODE_STATE_UNKNOWN
E_ACTIVE_GRAPH_EDGE_TARGET_MISSING
E_ACTIVE_GRAPH_EDGE_SOURCE_MISSING
E_ACTIVE_GRAPH_DYNAMIC_EXPRESSION_UNRESOLVED
E_ACTIVE_GRAPH_COMPUTED_GLOBAL_UNRESOLVED
E_ACTIVE_GRAPH_EXECUTABLE_REGION_UNCLASSIFIED
E_ACTIVE_GRAPH_BOOT_CYCLE_REENTRY
```

## 42. Side Effect

```text
E_ACTIVE_GRAPH_SIDE_EFFECT_UNDECLARED
E_ACTIVE_GRAPH_SIDE_EFFECT_DUPLICATE
E_ACTIVE_GRAPH_SIDE_EFFECT_OWNER_MISSING
E_ACTIVE_GRAPH_SIDE_EFFECT_CARDINALITY
E_ACTIVE_GRAPH_SIDE_EFFECT_DISPOSER_MISSING
E_ACTIVE_GRAPH_STALE_EPOCH_CALLBACK
E_ACTIVE_GRAPH_ORPHAN_TIMER
E_ACTIVE_GRAPH_ORPHAN_OBSERVER
```

## 43. Randomness

```text
E_ACTIVE_GRAPH_RANDOMNESS_FORBIDDEN
E_ACTIVE_GRAPH_TIME_INPUT_FORBIDDEN
E_ACTIVE_GRAPH_UNSEEDED_TEST_PRNG
E_ACTIVE_GRAPH_JOB_ID_NONDETERMINISTIC
E_ACTIVE_GRAPH_ENTROPY_PLACEHOLDER_ACTIVE
```

## 44. Asset

```text
E_ACTIVE_GRAPH_ASSET_UNDECLARED
E_ACTIVE_GRAPH_ASSET_ROUTE_MISSING
E_ACTIVE_GRAPH_ASSET_DIGEST_MISMATCH
E_ACTIVE_GRAPH_ASSET_MIME_MISMATCH
E_ACTIVE_GRAPH_ASSET_OWNER_MISSING
E_ACTIVE_GRAPH_ASSET_OBSERVED_UNADMITTED
E_ACTIVE_GRAPH_REQUIRED_ASSET_UNOBSERVED
E_ACTIVE_GRAPH_OPTIONAL_ASSET_NO_SCENARIO
E_ACTIVE_GRAPH_EXTERNAL_NETWORK_REQUEST
E_ACTIVE_GRAPH_SHADER_FALLBACK_UNDECLARED
```

## 45. Quarantine

```text
E_ACTIVE_GRAPH_QUARANTINE_DIGEST_MISMATCH
E_ACTIVE_GRAPH_QUARANTINE_ROUTE_EXPOSED
E_ACTIVE_GRAPH_QUARANTINE_EMITTED
E_ACTIVE_GRAPH_QUARANTINE_PACKAGED
E_ACTIVE_GRAPH_QUARANTINE_BEHAVIOR_DRIFT
E_ACTIVE_GRAPH_UNRESOLVED_CODE_LEFT_ACTIVE
```

## 46. Parity and Mutation

```text
E_ACTIVE_GRAPH_OUTPUT_SHA_DRIFT
E_ACTIVE_GRAPH_CAPABILITY_SET_DRIFT
E_ACTIVE_GRAPH_ENCODER_IDENTITY_DRIFT
E_ACTIVE_GRAPH_SURFACE_REVISION_DRIFT
E_ACTIVE_GRAPH_STABLE_ERROR_DRIFT
E_ACTIVE_GRAPH_SOURCE_MUTATION_OUTSIDE_ALLOWLIST
E_ACTIVE_GRAPH_PRODUCTION_POINTER_MUTATION
```

### 46.1 실패 영수증

모든 실패는 최소 다음을 포함한다.

```text
failureId
runId
stage
stableErrorCode
ownerNodeId
sourceRelative
scenarioId
baselineDigest
observedDigest
expectedDigest
productionPointerMutation=false
```

---

# PART L. 실행 도구 구조

## 47. 권장 도구

```text
tools/active-graph-01/
  lib.mjs
  scan-js-ast.mjs
  scan-html-roots.mjs
  generate-active-graph.mjs
  generate-side-effect-manifest.mjs
  generate-runtime-asset-manifest.mjs
  audit-randomness.mjs
  build-quarantine-manifest.mjs
  verify-static-closure.mjs
  verify-quarantine-exclusion.mjs
  run-packaged-observation.mjs
  compare-baseline-behavior.mjs
  issue-final-receipt.mjs
  gate-source.mjs
  run.mjs
```

## 48. Package Scripts

```json
{
  "generate:active-graph-01": "node tools/active-graph-01/generate-active-graph.mjs",
  "verify:active-graph-01:source": "node tools/active-graph-01/gate-source.mjs",
  "verify:active-graph-01:runtime": "node tools/active-graph-01/run-packaged-observation.mjs",
  "verify:active-graph-01": "node tools/active-graph-01/run.mjs"
}
```

## 49. 단일 진입점

Canonical 실행:

```powershell
npm run verify:active-graph-01
```

실행 순서:

```text
1. Baseline Receipt Admission
2. Source Authority Snapshot
3. AST and HTML Root Scan
4. Active Graph Generation
5. Side Effect Manifest Generation
6. Randomness Audit
7. Dynamic Asset Manifest Generation
8. Static Closure Gate
9. Dual Clean Emit
10. Quarantine Exclusion Gate
11. Packaged Scenario Observation
12. Behavioral Baseline Comparison
13. Final Receipt Issue
```

중간 실패 시 후속 단계는 실행하지 않는다.

---

# PART M. Gate Matrix

## 50. 필수 Gate

| Gate ID | 검증 대상 | PASS 조건 |
|---|---|---|
| AG01-01 | Baseline admission | `PACKAGED_BASELINE_VERIFIED` |
| AG01-02 | Source authority | 입력 digest 고정 |
| AG01-03 | Root manifest | 모든 Root 선언 |
| AG01-04 | Node manifest | 미분류 Node 0 |
| AG01-05 | Edge closure | unresolved Edge 0 |
| AG01-06 | Classic globals | 소유자 불명 global 0 |
| AG01-07 | Computed lookup | unresolved computed call 0 |
| AG01-08 | Side effects | 소유자 누락 0 |
| AG01-09 | Listener cardinality | duplicate 0 |
| AG01-10 | Disposer | orphan side effect 0 |
| AG01-11 | Randomness | active source 0 |
| AG01-12 | Time input | algorithm input 0 |
| AG01-13 | Job IDs | sequence SSOT 사용 |
| AG01-14 | Entropy placeholder | active placeholder 0 |
| AG01-15 | Asset manifest | 모든 asset ID·digest 보유 |
| AG01-16 | Literal asset | missing route 0 |
| AG01-17 | Shader closure | undeclared fallback 0 |
| AG01-18 | Worker closure | parent·child 모두 선언 |
| AG01-19 | WASM closure | route·MIME·digest 정확 |
| AG01-20 | External network | 0 request |
| AG01-21 | Required observation | required unobserved 0 |
| AG01-22 | Optional scenarios | scenario 누락 0 |
| AG01-23 | Quarantine archive | 원본 SHA 보존 |
| AG01-24 | Route exclusion | quarantine route 0 |
| AG01-25 | Package exclusion | quarantine bytes 0 |
| AG01-26 | Main decomposition | unclassified region 0 |
| AG01-27 | Empty placeholder | active placeholder 0 |
| AG01-28 | Missing asset branch | active missing asset 0 |
| AG01-29 | Unknown callable | active unresolved call 0 |
| AG01-30 | Boot parity | 상태 전이 동일 |
| AG01-31 | Output parity | 포맷별 SHA 동일 |
| AG01-32 | Encoder identity | 동일 |
| AG01-33 | Surface revision | 동일 |
| AG01-34 | Worker restart | 의미 동일 |
| AG01-35 | Relaunch | 의미 동일 |
| AG01-36 | Stable errors | drift 0 |
| AG01-37 | Source mutation | allowlist 밖 0 |
| AG01-38 | Production pointer | mutation false |
| AG01-39 | Final receipt | self-digest 유효 |
| AG01-40 | Promotion ceiling | final promotion false |

---

## 51. 현재 결함별 완료 판정

### 51.1 빈 `newFunction()`

PASS 조건:

- active graph에서 제거 또는 명시적 실제 구현에 연결
- 임의 구현 추가 금지
- behavioral parity 유지

### 51.2 Random Entropy

PASS 조건:

- `Math.random()` 3개 자동튜닝 경로 제거
- 실제 metric 또는 canonical default로 대체
- 파라미터 source receipt 기록

### 51.3 Random Job ID

PASS 조건:

- monotonic sequence SSOT로 교체
- Worker response attribution parity
- collision 0

### 51.4 `DeltaKWebGL-1.js`

PASS 조건:

- 정확한 authority asset에 연결되거나 해당 branch Quarantine
- passthrough fallback 금지
- missing route 0

### 51.5 `reactorDecideAndEvolve`

PASS 조건:

- 단일 owner Node와 implementation digest 확인 또는 branch Quarantine
- silent undefined call 0

### 51.6 중복 DOM Binding

PASS 조건:

- `exportSpotPsdBtn` purpose binding exactly-one
- `preblurSlider` purpose binding exactly-one
- relaunch/remount 후 stale listener 0

---

# PART N. 최종 PASS

## 52. 최종 PASS 문구

모든 Gate가 닫힌 경우에만 다음을 출력한다.

```text
PASS TDT-ACTIVE-GRAPH-01
state=ACTIVE_GRAPH_VERIFIED_UNPROMOTED
baselineReceipt=<digest>
activeGraph=<digest>
dynamicAssets=<digest>
sideEffects=<digest>
quarantine=<digest>
randomnessSources=0
unresolvedDynamicAssets=0
duplicateSideEffects=0
unclassifiedExecutableRegions=0
externalNetworkRequests=0
behavioralParity=true
quarantineExcludedFromPackage=true
productionPointerMutation=false
finalPromotionPassIssued=false
```

다음 문구는 금지한다.

```text
PRODUCTION_PROMOTED
FULL_LEGACY_REMOVED
WEBGPU_END_TO_END
GPU_DEVICE_SSOT_COMPLETE
ALL_OPTIONAL_FEATURES_VERIFIED
```

---

## 53. 베이크 최소 범위

### 53.1 신규

- Active Runtime Graph schema와 generator
- AST 기반 JS/TS execution root scanner
- HTML inline root scanner
- Side Effect Registry와 Receipt
- Runtime Asset Authority와 generated manifest
- Deterministic Sequence Service
- Randomness Audit
- Quarantine Archive와 exclusion verifier
- Packaged route observation
- Behavioral Baseline comparator
- Final Receipt issuer

### 53.2 기존 보강

- `LegacyRuntimeAdapter`가 Active Graph Root ID를 검증
- `generated-legacy-manifest.json`을 Active Graph projection으로 전환
- Static COI Server가 route observation receipt 기록
- Worker Broker가 deterministic job sequence를 소비
- Electron packaged test harness가 active graph snapshot을 노출
- Build Emit가 quarantine exclusion을 검증

### 53.3 수정 금지

- `jxl_encode_qmap_ex()` ABI
- `encode_mozjpeg_RGB()` ABI
- Encoder Worker Protocol version
- Final Surface revision contract
- PSD Independent Parser fail-closed 범위
- Production Pointer
- 사용자 Export Directory

---

## 54. 후속 명세 인계

본 명세가 PASS하면 다음으로 인계한다.

```text
TDT-GPU-DEVICE-SSOT-01
Single Adapter·Device Epoch /
Legacy-New Runtime Device Ownership Unification /
Device Loss Recovery /
Cross-Device Handle Rejection /
GPU Capability Receipt Seal
```

인계 Manifest에는 다음을 포함한다.

- Active Graph Digest
- Active GPU Node Set
- GPU Device creation callsite set
- WebGL/WebGPU bridge callsite set
- Resource owner Node set
- Surface producer/consumer Edge set
- Worker GPU capability set
- Behavioral Baseline Receipt Digest

GPU SSOT 명세는 본 명세에서 확정한 Active Node만 대상으로 삼아야 한다.

Quarantine Node를 GPU 통합 대상으로 다시 끌어오면 안 된다.

---

## 55. 최종 판단

현재 다듬다듬의 문제는 코드가 많다는 사실 자체가 아니다.

문제는 어떤 코드가 살아 있고, 어떤 코드가 잠든 척하면서 이벤트와 전역을 통해 다시 살아날 수 있는지 경계가 흐리다는 점이다.

파일 단위 Admission은 이미 1,171개 중 214개로 외곽 숲을 잘라냈다.

이제 남은 작업은 214개 안쪽의 전선을 정리하는 것이다.

특히 `main.js`는 단순한 큰 파일이 아니다.

실제 알고리즘, 실험용 자동튜닝, 빈 함수, 중복 이벤트, 오래된 Export 조각, 동적 자산 참조가 한 평가 단위에 붙어 있다.

이 상태에서 GPU Device SSOT나 Surface Lifecycle을 먼저 고치면, 후속 패치가 어느 경로를 살리고 어느 경로를 죽였는지 다시 추적해야 한다.

따라서 본 명세의 봉인식은 다음과 같다.

```text
Declared Root
+ Closed Execution Edge
+ Owned Side Effect
+ Zero Runtime Entropy
+ Exact Dynamic Asset
- Quarantined Branch
= Reproducible Active Runtime Graph
```

그리고 이 Graph가 기존 Packaged Baseline과 동일한 결과를 내는 것까지 증명해야 한다.

코드를 줄였다는 만족감이 아니라, **살아 있는 코드가 누구인지 다시 묻지 않아도 되는 상태**가 이번 명세의 완료다.
