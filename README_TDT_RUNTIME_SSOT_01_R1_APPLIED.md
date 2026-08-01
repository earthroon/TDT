# TDT-RUNTIME-SSOT-01-R1 Applied

## Patch identity

```text
TDT-RUNTIME-SSOT-01-R1
Vite Authoritative Entry /
Vue Application Shell /
Pinia Serializable State Ownership /
Runtime Service Isolation /
Deterministic Boot Receipt Seal
```

## Bake status

```text
SOURCE_BAKED_UNPROMOTED
```

이 소스 베이크는 R1의 구조와 정적 봉인을 본체에 적용했다. 다만 현재 실행 환경에서 npm 레지스트리에 접근할 수 없어 신규 Vue, Pinia, Vite 의존성을 설치하지 못했다. 따라서 Vite production bundle, `vue-tsc`, Electron renderer smoke는 실행하지 못했으며 Promotion PASS는 발급하지 않는다.

## 적용된 권위 구조

```text
app/index.html
└─ /src/main.ts                         유일한 실행 진입점

Vite Module Graph
└─ 실행 가능한 renderer source 권위

Vue Application Shell
└─ 화면, DOM mount, Safe Diagnostic 전환 권위

Pinia Stores
└─ 직렬화 가능한 UI, 작업, 진단 메타데이터 권위

Runtime Service Container
├─ GPUDevice와 GPU resource 수명
├─ Worker registry
├─ Decoder registry
├─ Encoder registry
├─ Pipeline authority
├─ Preview presenter
└─ Final export authority

LegacyRuntimeAdapter
└─ 명시적으로 승인된 기존 스크립트만 순차 활성화

Deterministic Boot Receipt
└─ module plan, service plan, manifest, capability 결과 봉인
```

## 주요 변경

### 1. Vite authoritative entry

- `app/index.html`의 실행 스크립트를 `/src/main.ts` 하나로 폐쇄했다.
- 기존 대규모 script 적층은 `app/src/legacy/generated-legacy-manifest.json`으로 이동했다.
- Electron production server는 `dist/renderer/`만 제공하도록 변경했다.
- 기존 `/app/` 경로 재작성과 원본 source serving을 제거했다.
- Vite build가 `dadum-vite-entry-manifest.json`과 `dadum-runtime-manifest.json`을 생성하도록 플러그인을 추가했다.

### 2. Vue application shell

- `App.vue`에서 Boot, Safe Diagnostic, Workspace 상태를 분기한다.
- 기존 UI markup은 `LegacyDomIsland.vue`가 소유하는 격리 영역으로 이식했다.
- Legacy DOM은 boot 완료 전 inert 상태로 유지된다.
- Required module 실패 시 workspace를 열지 않고 Safe Diagnostic만 노출한다.

### 3. Pinia serializable state ownership

추가된 store:

```text
boot.store.ts
 document.store.ts
processing.store.ts
preview.store.ts
export.store.ts
diagnostics.store.ts
```

Store에는 다음처럼 직렬화 가능한 값만 둔다.

```text
primitive / plain object / array / enum / stable error code /
resourceId / surfaceId / revision / receipt digest
```

다음 Runtime 객체는 Pinia에 넣지 않는다.

```text
GPUDevice / GPUTexture / GPUBuffer / Worker / MessagePort /
WASM instance / Canvas / ImageBitmap / ImageData / File / Blob /
Promise / function / native handle
```

`serializableStatePlugin`과 정적 검증 스크립트가 이 경계를 확인한다.

### 4. Runtime service isolation

추가된 주요 service:

```text
dadum.runtime.host-bridge
dadum.runtime.resource-registry
dadum.runtime.gpu
dadum.runtime.worker-registry
dadum.runtime.decoder-registry
dadum.runtime.encoder-registry
dadum.runtime.pipeline
dadum.runtime.preview-presenter
dadum.runtime.export-authority
dadum.runtime.receipt
dadum.runtime.diagnostics
dadum.runtime.legacy-adapter
```

- Service token과 owner module을 명시했다.
- GPU resource는 epoch와 opaque ID를 통해서만 UI 상태에 투영된다.
- Device lost 시 기존 epoch의 resource ID를 폐기한다.
- Pipeline service는 `__dk_placeholder` 객체를 authority로 승인하지 않는다.
- Export authority는 final surface가 없으면 실패하며 source surface로 자동 하강하지 않는다.

### 5. Legacy migration bridge

- 기존 본체는 `app/legacy-runtime/`에 보존했다.
- 원본 `index.html`은 `app/legacy-source/original-index.html`에 보존했다.
- 기존 index의 실행 스크립트 50개를 명시적 manifest로 등록했다.
- `/app/` 경로 방언은 `/legacy/` Vite runtime route로 정규화했다.
- 각 root script는 순차 로드된다.
- legacy tree 전체에서 발견한 global write name 1,988개를 생성 Registry로 고정했다.

이 Registry는 이행기 감사면이다. 최종 목표는 1,988개 전역을 유지하는 것이 아니라, 모듈별 capability와 service로 줄이는 것이다. 현재 감사는 새로 생성된 전역 key를 포착하지만 기존 전역 객체 내부의 속성 변이까지 완전히 추적하지는 않는다.

### 6. Deterministic boot receipt

Receipt의 결정적 payload와 비결정적 telemetry를 분리했다.

Seal 포함:

```text
buildId
runtime module plan
service ownership plan
source graph digest
legacy manifest digest
capability activation result
stable error codes
runtime epoch
```

Seal 제외:

```text
wall clock timestamp
attempt UUID
raw stack
elapsed milliseconds
user agent
```

동일 fixture 반복 100회에서 receipt digest parity를 검증한다.

## 정적 Gate 결과

```text
PASS GATE-R1-01 Vite entry closure
PASS GATE-R1-02 Production source serving closure
PASS GATE-R1-06 Capability ownership
PASS GATE-R1-07 Service ownership
PASS GATE-R1-08 Pinia static serializability
PASS GATE-R1-11 Legacy admission and syntax
PASS GATE-R1-15 Runtime resource isolation
PASS GATE-R1-17 Final export authority
PASS GATE-R1-20 Deterministic receipt parity 100/100
PASS TypeScript parser syntax, 48 TS/Vue units
PASS GATE-R1-ERROR-CODE Stable error registry 29/29
```

정적 Source Bake marker:

```text
PASS_TDT_RUNTIME_SSOT_01_R1_SOURCE_BAKE_UNPROMOTED
```

## 현재 수치

```text
Root executable entry             1
Legacy root scripts admitted     50
Legacy runtime files          1,150
Generated legacy globals      1,988
Runtime modules                  13
Runtime services                 12
Pinia store source files           8
Vue SFC files                      5
```

## Promotion을 막는 항목

### BLOCK-R1-LOCK-001

`package.json`에 추가한 Vue, Pinia, Vite 계열 의존성이 기존 `package-lock.json`에 아직 반영되지 않았다.

```text
lockConsistency = false
promotable = false
```

### BLOCK-R1-BUILD-001

현재 환경에는 local `vite` binary가 없다.

```text
npm run build:renderer
→ sh: vite: not found
→ exit 127
```

따라서 다음은 미검증이다.

```text
vue-tsc semantic typecheck
Vite production bundle
Build output manifest parity
Electron renderer boot smoke
WebGPU device acquisition smoke
Legacy runtime browser execution
Final export E2E
```

## Promotion 실행 순서

네트워크와 npm registry를 사용할 수 있는 동일 소스 환경에서 다음 순서로 닫는다.

```bash
npm install
npm run verify:renderer
npm run start
```

Promotion 조건:

```text
package-lock consistency PASS
vue-tsc PASS
Vite production build PASS
dist/renderer only serving PASS
Electron boot READY receipt PASS
Required module fail-closed fixture PASS
Device-lost epoch recreation PASS
Final export authority E2E PASS
```

최종 Promotion 전에는 아래 Marker를 발급하지 않는다.

```text
PASS_TDT_RUNTIME_SSOT_01_R1_VITE_AUTHORITATIVE_ENTRY_VUE_APPLICATION_SHELL_PINIA_SERIALIZABLE_STATE_OWNERSHIP_RUNTIME_SERVICE_ISOLATION_DETERMINISTIC_BOOT_RECEIPT_SEAL
```
