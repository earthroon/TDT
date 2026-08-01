# TDT-EXPORT-WORKER-01
## Vite Worker URL Authority / Encoder Worker Broker / Control Protocol Version / Runtime Epoch / Worker Artifact Digest Seal

> **상태:** IMPLEMENTATION SPECIFICATION  
> **부모 봉인:** `TDT-RUNTIME-SSOT-01-R7`  
> **대상 저장소:** 다듬다듬 R1-R7 Vite·Vue3·Pinia Runtime  
> **승격 성격:** 레거시 Worker/WASM 구현 보존 + Worker 생성·수명·정체성 권위의 Runtime 회수  
> **후속 명세:** `TDT-EXPORT-WORKER-02 Unified Encoder RPC / Timeout / Cancel / Crash Restart / Pending Job Closure Seal`

---

# 0. 문서 목적

R7은 다음 권위선을 봉인했다.

```text
Final Surface
→ Exact Encoder Identity
→ Applied Format
→ Output Bytes
→ Signature Verification
→ Export Receipt
```

그러나 실제 바이트를 만드는 Worker는 아직 신규 Runtime의 통제를 받지 않는다.

현재 활성 경로에는 다음 구조가 공존한다.

```text
Runtime WorkerRegistryService
→ Worker 생성 API는 존재
→ 실제 Encoder Worker를 소유하지 않음

Legacy ExportManager
→ WebP Worker 직접 생성
→ PNG16 Worker 직접 생성

Legacy PSD Bridge
→ PSD Worker 직접 생성

각 Worker
→ 서로 다른 상대 URL
→ 서로 다른 초기화 방식
→ 서로 다른 message contract
→ 개별 pending map
→ 개별 beforeunload terminate
```

따라서 R7 Receipt가 Encoder Identity를 증명해도 다음은 아직 증명하지 못한다.

- 어떤 Worker Script가 실행됐는가
- Worker URL이 Vite Build Graph에 귀속됐는가
- Worker가 현재 Runtime Epoch의 인스턴스인가
- Worker Protocol Version이 호출자와 일치하는가
- Worker Script와 WASM Asset이 빌드 당시 승인된 바이트인가
- 이전 Runtime Epoch Worker의 늦은 응답이 채택되지 않았는가
- 동일 Worker ID가 두 장소에서 생성되지 않았는가

본 명세는 이 공백을 닫는다.

---

# 1. 한 문장 목표

> **모든 활성 Encoder Worker의 생성·URL 해석·Control Handshake·Runtime Epoch·Artifact Digest·Dispose 권위를 `EncoderWorkerBrokerService` 하나에 귀속시키고, 레거시 ExportManager는 Worker를 직접 만들지 않는 호환 클라이언트로 강등한다.**

---

# 2. 비목표

본 명세는 다음을 수행하지 않는다.

- WebP·PNG16·PSD의 Codec 알고리즘 변경
- JXL·JPEG·PNG8의 Worker 이전
- 모든 Codec Message를 단일 `encode` RPC로 통합
- Job Timeout 정책 완성
- AbortSignal 기반 취소 완성
- Worker Crash 자동 재시작 완성
- Pending Job Drain·Leak Gate 완성
- PSD Plane Split·LCMS의 Worker 이전
- WebP Canvas Fallback 의미 정책의 최종 폐쇄
- Worker Pool 또는 동시성 Scheduler 도입

이 항목들은 후속 `TDT-EXPORT-WORKER-02` 이후에 다룬다.

본 명세는 **Control Plane을 통일**한다.

각 Codec의 Data Plane 명령은 임시로 유지한다.

```text
WebP
init / encode_full / ready / done / error

PNG16
encode / done / error

PSD
export / done / error
```

단, 모든 Data Plane Message에는 본 명세가 정의하는 공통 Runtime Metadata가 포함돼야 한다.

---

# 3. 현재 코드 기준선

## 3.1 신규 Worker Registry

현재 파일:

```text
app/src/runtime/workers/worker-registry-service.ts
```

현재 책임:

```text
Worker ID 중복 검사
new Worker(url, { type: 'module', name: id })
protocolVersion 문자열 보관
Runtime dispose 시 terminate
```

현재 미보유 책임:

- Worker Descriptor Manifest
- Vite Emitted URL 권위
- Worker Artifact SHA-256
- Static Dependency Artifact Set
- Control Handshake
- Runtime Epoch Message Verification
- Worker Ready 상태
- Worker Health 상태
- Stale Message Rejection
- Script Identity Receipt
- Legacy Bridge
- Worker Ownership Receipt

## 3.2 WebP Lossless

현재 Worker 생성 위치:

```text
app/legacy-runtime/export_manager.js
```

현재 생성문:

```js
new Worker('./encoder_full_worker.js', { type: 'module' })
```

현재 Worker Entry:

```text
app/legacy-runtime/encoder_full_worker.js
```

현재 내부 Module 경로:

```js
import(d.modulePath || './encoders/webp_api.js')
```

현재 특성:

- Worker 직접 생성
- Worker 자체 Pending Map
- `beforeunload` 직접 terminate
- `readyPromise` 직접 관리
- Worker Script URL과 내부 Module URL이 문자열
- Runtime Epoch 없음
- Script Digest 없음
- Build ID Handshake 없음

## 3.3 PNG16

현재 Worker 생성 위치:

```text
app/legacy-runtime/export_manager.js
```

현재 생성문:

```js
new Worker('./workers/encode_lodepng16.worker.js', { type: 'module' })
```

현재 Worker Entry:

```text
app/legacy-runtime/workers/encode_lodepng16.worker.js
```

현재 Worker 내부 Import:

```js
import {
  encodePNG16RGBA,
  encodePNG16FromRGBA8,
} from '../encoders/png16_lode_bridge.mjs';
```

현재 특성:

- Worker 직접 생성
- Worker 자체 Pending Map
- 입력 Buffer Transfer로 Caller Buffer Detach 가능
- Ready Handshake 없음
- Runtime Epoch 없음
- Script Digest 없음
- Worker Dispose 소유권 불명확

## 3.4 PSD

현재 Worker 생성 위치:

```text
app/legacy-runtime/libs/psd/psd_export_bridge.js
```

현재 생성문:

```js
new Worker('./workers/psd_export.worker.js', { type: 'module' })
```

현재 실제 Worker Entry:

```text
app/legacy-runtime/workers/psd_export.worker.js
```

현재 Worker WASM URL:

```js
new URL(
  '../libs/psd/pkg/psd_exporter_wasm_bg.wasm',
  import.meta.url,
)
```

현재 특성:

- Worker 생성 URL과 실제 파일 상대 위치가 불일치할 위험
- WASM URL은 `import.meta.url` 기반
- Worker 생성은 문자열 기반
- Worker 자체 Pending Map
- Runtime Epoch 없음
- Script·WASM Artifact Set Digest 없음

## 3.5 Vite 기준

현재 Vite 설정:

```text
root: app
base: /
publicDir: false
outDir: ../dist/renderer
manifest: true
target: es2022
```

`publicDir: false`이므로 활성 Worker는 Vite Module Graph에 포함되거나 명시적으로 복사·해시되는 권위 경로가 필요하다.

문자열 Worker URL과 원본 `/legacy/**` 파일 존재만으로는 제품 Build에서 URL 생존을 증명할 수 없다.

---

# 4. 핵심 설계 결정

## 4.1 Worker 생성 권위는 하나다

제품 Runtime에서 `new Worker()`를 호출할 수 있는 권위자는 다음 하나다.

```text
dadum.runtime.encoder-worker-broker
```

`WorkerRegistryService`는 하위 저수준 Registry로 남을 수 있으나, Encoder Worker를 직접 요청하는 제품 API는 Broker만 노출한다.

허용:

```text
EncoderWorkerBrokerService
→ WorkerRegistryService
→ new Worker()
```

금지:

```text
Legacy ExportManager
→ new Worker()

Legacy PSD Bridge
→ new Worker()

Vue Component
→ new Worker()

EncoderRegistryService
→ new Worker()

ExportAuthorityService
→ new Worker()
```

## 4.2 Worker URL은 Vite Static Graph가 소유한다

활성 Encoder Worker Entry는 `app/src` 아래에 둔다.

권장 경로:

```text
app/src/runtime/workers/entries/
├─ webp-lossless.worker.ts
├─ png16.worker.ts
└─ psd-export.worker.ts
```

각 Entry는 현재 레거시 구현을 import하거나 최소한의 Adapter를 포함한다.

예:

```ts
import '../../../legacy-runtime/encoder_full_worker.js';
```

다만 레거시 Worker가 `self.onmessage = ...`를 직접 소유하면 Control Handshake 삽입이 어렵다.

따라서 권장 구조는 다음이다.

```text
Vite Worker Entry
├─ Control Plane Adapter
├─ Runtime Epoch Guard
├─ Protocol Handshake
└─ Legacy Codec Handler Module
```

레거시 Worker 파일은 직접 Entry가 아니라 Handler Module로 승격한다.

권장 경로:

```text
app/legacy-runtime/worker-codecs/
├─ webp-lossless-handler.js
├─ png16-handler.js
└─ psd-export-handler.js
```

Handler Contract:

```ts
export interface LegacyCodecWorkerHandler {
  initialize?(context: WorkerCodecContext): Promise<void>;
  handle(message: unknown, context: WorkerCodecContext): Promise<unknown>;
  dispose?(reason: string): Promise<void> | void;
}
```

## 4.3 Control Protocol과 Codec Protocol을 분리한다

공통 Control Protocol:

```text
dadum-worker-control-v1
```

Codec Data Protocol:

```text
dadum-webp-lossless-worker-v1
dadum-png16-worker-v1
dadum-psd-export-worker-v1
```

R1에서 통일하는 것은 다음뿐이다.

- HELLO
- READY
- REJECT
- HEALTH
- DISPOSE
- EPOCH
- BUILD ID
- ARTIFACT SET IDENTITY

Codec별 `encode_full`, `encode`, `export` 명령은 유지한다.

## 4.4 Worker Epoch는 Runtime Epoch에서 파생한다

```text
runtimeEpoch
→ workerGeneration
→ workerEpoch
```

권장 Worker Epoch:

```text
<runtimeEpoch>:<workerId>:<generation>
```

예:

```text
17:dadum.worker.encoder.webp-lossless-v1:1
```

Worker가 Crash하거나 명시적으로 재생성될 때 generation이 증가한다.

R1에서는 자동 재시작을 수행하지 않더라도, 재생성 시 stale reply를 구분할 수 있어야 한다.

## 4.5 Script Digest는 단일 Entry 파일이 아니라 Artifact Set을 봉인한다

Worker의 실행 의미는 다음 전체에 의해 결정된다.

```text
Worker Entry JS
Imported Chunk JS
Codec Bridge JS
WASM Binary
관련 정적 Asset
```

따라서 단일 `scriptSha256`만으로 부족하다.

본 명세는 두 Digest를 정의한다.

```text
entryAssetSha256
workerArtifactSetDigest
```

`entryAssetSha256`:

```text
Vite가 방출한 Worker Entry JavaScript 바이트 SHA-256
```

`workerArtifactSetDigest`:

```text
Worker Entry의 정적 실행 그래프에 포함된
JS / WASM / 필수 정적 Asset의
(path, byteLength, sha256) 정렬 목록 Digest
```

---

# 5. 신규 Runtime 서비스

## 5.1 Service ID

```ts
SERVICE_IDS.encoderWorkerBroker =
  'dadum.runtime.encoder-worker-broker';
```

## 5.2 Capability

```text
dadum.encoder.worker-broker
```

## 5.3 Runtime Module

```text
dadum.module.encoder-worker-v1
```

권장 의존성:

```text
dadum.module.foundation-v1
dadum.module.resources-v1
dadum.module.worker-v1
dadum.module.legacy-adapter-v1
```

제공 Capability:

```text
dadum.encoder.worker-broker
```

소비 Capability:

```text
dadum.worker.registry
dadum.resource.registry
dadum.legacy.runtime
dadum.diagnostics
```

소유 서비스:

```text
dadum.runtime.encoder-worker-broker
```

`dadum.module.encode-v1`은 다음에 의존해야 한다.

```text
dadum.module.encoder-worker-v1
```

단, 모든 Encoder가 Worker형인 것은 아니다.

R1에서는 Worker-backed Encoder Descriptor만 Broker Binding을 요구한다.

---

# 6. Worker Descriptor SSOT

## 6.1 타입

```ts
export type EncoderWorkerId =
  | 'dadum.worker.encoder.webp-lossless-v1'
  | 'dadum.worker.encoder.png16-v1'
  | 'dadum.worker.encoder.psd-export-v1';

export interface EncoderWorkerArtifact {
  url: string;
  byteLength: number;
  sha256: string;
  role: 'entry' | 'chunk' | 'wasm' | 'asset';
}

export interface EncoderWorkerDescriptor {
  workerId: EncoderWorkerId;
  ownerRuntimeEncoderIds: string[];

  controlProtocolVersion: 'dadum-worker-control-v1';
  codecProtocolVersion: string;

  entrySourceIdentity: string;
  entryUrl: URL;

  buildId: string;
  sourceGraphDigest: string;
  entryAssetSha256: string;
  workerArtifactSetDigest: string;
  artifacts: EncoderWorkerArtifact[];

  workerType: 'module';
  required: boolean;
  realization: 'lazy' | 'eager';
  maxInstances: 1;

  transferPolicyId: string;
  wasmPolicyId: string;
  legacyCodecHandlerId: string;
}
```

## 6.2 Descriptor 목록

### WebP Lossless

```json
{
  "workerId": "dadum.worker.encoder.webp-lossless-v1",
  "ownerRuntimeEncoderIds": [
    "dadum.encoder.webp-lossless.v1"
  ],
  "controlProtocolVersion": "dadum-worker-control-v1",
  "codecProtocolVersion": "dadum-webp-lossless-worker-v1",
  "entrySourceIdentity": "vite:app/src/runtime/workers/entries/webp-lossless.worker.ts",
  "realization": "lazy",
  "maxInstances": 1,
  "transferPolicyId": "sab-copy-input-transfer-output-v1",
  "wasmPolicyId": "webp-wasm-worker-only-v1",
  "legacyCodecHandlerId": "dadum.legacy.worker-codec.webp-lossless-v1"
}
```

### PNG16

```json
{
  "workerId": "dadum.worker.encoder.png16-v1",
  "ownerRuntimeEncoderIds": [
    "dadum.encoder.png16.v1"
  ],
  "controlProtocolVersion": "dadum-worker-control-v1",
  "codecProtocolVersion": "dadum-png16-worker-v1",
  "entrySourceIdentity": "vite:app/src/runtime/workers/entries/png16.worker.ts",
  "realization": "lazy",
  "maxInstances": 1,
  "transferPolicyId": "transfer-input-transfer-output-v1",
  "wasmPolicyId": "lodepng-wasm-worker-only-v1",
  "legacyCodecHandlerId": "dadum.legacy.worker-codec.png16-v1"
}
```

### PSD Export

```json
{
  "workerId": "dadum.worker.encoder.psd-export-v1",
  "ownerRuntimeEncoderIds": [
    "dadum.encoder.psd.v1"
  ],
  "controlProtocolVersion": "dadum-worker-control-v1",
  "codecProtocolVersion": "dadum-psd-export-worker-v1",
  "entrySourceIdentity": "vite:app/src/runtime/workers/entries/psd-export.worker.ts",
  "realization": "lazy",
  "maxInstances": 1,
  "transferPolicyId": "transfer-request-transfer-output-v1",
  "wasmPolicyId": "psd-rust-wasm-worker-serializer-v1",
  "legacyCodecHandlerId": "dadum.legacy.worker-codec.psd-export-v1"
}
```

## 6.3 Descriptor 권위

Descriptor는 런타임에서 임의 생성하지 않는다.

권위 생성자:

```text
Vite Runtime Manifest Plugin
```

생성 파일 권장:

```text
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/workers/generated-worker-manifest.json
```

제품 빌드 산출물:

```text
dist/renderer/runtime-worker-manifest.json
```

---

# 7. Vite Worker URL Authority

## 7.1 허용 형태

```ts
const workerUrl = new URL(
  './entries/webp-lossless.worker.ts',
  import.meta.url,
);
```

또는 Vite의 명시적 Worker Import:

```ts
import WebpLosslessWorker from
  './entries/webp-lossless.worker.ts?worker';
```

단, 프로젝트 전체에서 하나의 형태를 선택한다.

권장 형태:

```text
new URL(..., import.meta.url)
```

이유:

- Emitted URL을 Manifest에 기록하기 쉬움
- Worker 생성 권위와 Constructor를 분리 가능
- URL을 Descriptor로 보존 가능
- Asset Hash 검증 가능

## 7.2 금지 형태

활성 제품 경로에서 다음은 금지한다.

```js
new Worker('./encoder_full_worker.js')
new Worker('./workers/encode_lodepng16.worker.js')
new Worker('./workers/psd_export.worker.js')
new Worker('/legacy/workers/...')
new Worker(workerPathString)
```

다음도 금지한다.

```js
const url = location.origin + '/legacy/' + name;
new Worker(url);
```

```js
const path = window.__APP_BASE__ + '/workers/' + file;
new Worker(path);
```

## 7.3 Legacy 파일 위치와 Emitted URL 분리

원본 Source Path는 Receipt에 남긴다.

```text
entrySourceIdentity
```

실행 URL은 Vite Emitted Asset URL이다.

```text
entryUrl
```

둘을 같은 값으로 취급하지 않는다.

예:

```json
{
  "entrySourceIdentity": "vite:app/src/runtime/workers/entries/png16.worker.ts",
  "entryUrl": "/assets/png16.worker-Ck91s4qT.js"
}
```

## 7.4 Worker URL 검증

Broker는 생성 전에 다음을 검증한다.

- URL Scheme이 `http:` 또는 `https:` 또는 제품에서 허용된 Electron App Scheme인가
- Origin이 Renderer Origin과 동일한가
- Runtime Worker Manifest에 존재하는가
- Entry Asset SHA-256이 Manifest와 일치하는가
- Build ID가 Boot Build ID와 일치하는가
- Worker ID가 Descriptor에 존재하는가

Dev Mode에서는 HMR URL이 변할 수 있다.

따라서:

```text
Development
→ Digest 검증 Warn 또는 Source Graph Digest 검증

Production
→ Emitted Asset Byte Digest 필수
```

제품 승격은 Production Gate만 인정한다.

---

# 8. Worker Artifact Manifest

## 8.1 스키마

```ts
export interface RuntimeWorkerManifest {
  schema: 'dadum-runtime-worker-manifest-v1';
  buildId: string;
  generatedBy: string;
  workers: EncoderWorkerDescriptor[];
  manifestDigest: string;
}
```

## 8.2 Canonical Digest Input

다음 필드는 Digest에서 제외한다.

- 생성 시간
- 절대 로컬 경로
- OS 사용자명
- 임시 빌드 폴더
- Vite 실행 PID
- 정렬되지 않은 Map 순서

다음은 포함한다.

- schema
- buildId
- workerId
- ownerRuntimeEncoderIds
- controlProtocolVersion
- codecProtocolVersion
- entrySourceIdentity
- emitted relative URL
- artifact path
- artifact byteLength
- artifact sha256
- transferPolicyId
- wasmPolicyId
- legacyCodecHandlerId

## 8.3 정렬

모든 배열은 UTF-16 코드 단위 오름차순으로 정렬한다.

`localeCompare()` 사용을 금지한다.

```ts
const compareStable = (a: string, b: string) =>
  a < b ? -1 : a > b ? 1 : 0;
```

## 8.4 Artifact Set

WebP 예:

```text
webp-lossless.worker-*.js
webp_api-*.js
webp_bindings_qmap-*.js
webp_bindings_qmap_bg-*.wasm
```

PNG16 예:

```text
png16.worker-*.js
png16_lode_bridge-*.js
lodepng16-*.wasm
```

PSD 예:

```text
psd-export.worker-*.js
psd_exporter_wasm-*.js
psd_exporter_wasm_bg-*.wasm
```

실제 Vite Chunk Graph에서 도출한다.

파일명 패턴 하드코딩으로 Artifact Set을 계산하지 않는다.

---

# 9. Control Protocol

## 9.1 Envelope

```ts
export interface WorkerControlEnvelope<TType extends string, TPayload> {
  channel: 'dadum.worker.control';
  type: TType;

  workerId: string;
  runtimeEpoch: number;
  workerEpoch: string;

  controlProtocolVersion: 'dadum-worker-control-v1';
  codecProtocolVersion: string;

  buildId: string;
  workerArtifactSetDigest: string;

  sequence: number;
  payload: TPayload;
}
```

## 9.2 HELLO

Main → Worker:

```json
{
  "channel": "dadum.worker.control",
  "type": "HELLO",
  "workerId": "dadum.worker.encoder.png16-v1",
  "runtimeEpoch": 17,
  "workerEpoch": "17:dadum.worker.encoder.png16-v1:1",
  "controlProtocolVersion": "dadum-worker-control-v1",
  "codecProtocolVersion": "dadum-png16-worker-v1",
  "buildId": "...",
  "workerArtifactSetDigest": "...",
  "sequence": 1,
  "payload": {
    "ownerRuntimeEncoderIds": [
      "dadum.encoder.png16.v1"
    ]
  }
}
```

## 9.3 READY

Worker → Main:

```json
{
  "channel": "dadum.worker.control",
  "type": "READY",
  "workerId": "dadum.worker.encoder.png16-v1",
  "runtimeEpoch": 17,
  "workerEpoch": "17:dadum.worker.encoder.png16-v1:1",
  "controlProtocolVersion": "dadum-worker-control-v1",
  "codecProtocolVersion": "dadum-png16-worker-v1",
  "buildId": "...",
  "workerArtifactSetDigest": "...",
  "sequence": 1,
  "payload": {
    "wasmReady": true,
    "implementationId": "dadum-lodepng16-wasm-v1",
    "codecCapabilities": [
      "rgba8-to-png16",
      "rgba16-to-png16"
    ]
  }
}
```

## 9.4 REJECT

Worker → Main:

```json
{
  "channel": "dadum.worker.control",
  "type": "REJECT",
  "payload": {
    "code": "E_WORKER_PROTOCOL_MISMATCH",
    "message": "codec protocol mismatch"
  }
}
```

## 9.5 HEALTH

R1에서는 수동 Health Probe만 정의한다.

```text
HEALTH
→ HEALTH_OK
```

자동 주기 Health Poll은 후속 명세 범위다.

## 9.6 DISPOSE

Main → Worker:

```text
DISPOSE
```

Worker → Main:

```text
DISPOSED
```

Worker가 응답하지 않아도 Runtime Dispose는 최종적으로 `terminate()`를 호출한다.

Grace Period와 Timeout은 후속 명세에서 세밀화한다.

R1의 최소 계약:

```text
DISPOSE 전달 시도
→ microtask 1회 양보
→ terminate
```

---

# 10. Data Plane Metadata

Codec별 명령 형태는 유지하되 다음 공통 필드를 추가한다.

```ts
export interface WorkerDataMetadata {
  __dadum: {
    workerId: string;
    runtimeEpoch: number;
    workerEpoch: string;
    codecProtocolVersion: string;
    jobId: string;
    requestSequence: number;
  };
}
```

WebP 예:

```js
workerClient.post({
  type: 'encode_full',
  id,
  sab,
  width,
  height,
  nearLossless,
  __dadum: metadata,
});
```

PNG16 예:

```js
workerClient.post({
  type: 'encode',
  id,
  width,
  height,
  rgba16,
  __dadum: metadata,
});
```

PSD 예:

```js
workerClient.post({
  type: 'export',
  id,
  requestBytes,
  __dadum: metadata,
});
```

Worker 응답도 같은 `__dadum`을 Echo해야 한다.

Main Broker는 다음 응답을 폐기한다.

- runtimeEpoch 불일치
- workerEpoch 불일치
- workerId 불일치
- codecProtocolVersion 불일치
- 미등록 jobId

폐기 시 Stable Diagnostic을 기록한다.

---

# 11. Worker Broker API

## 11.1 공개 타입

```ts
export interface EncoderWorkerLease {
  readonly workerId: string;
  readonly workerEpoch: string;
  readonly runtimeEpoch: number;
  readonly codecProtocolVersion: string;
  readonly state: EncoderWorkerState;

  post(
    message: Record<string, unknown>,
    transfer?: Transferable[],
  ): void;

  subscribe(
    listener: (message: unknown) => void,
  ): () => void;

  release(): void;
}
```

## 11.2 Broker API

```ts
export interface EncoderWorkerBroker {
  acquire(workerId: EncoderWorkerId): Promise<EncoderWorkerLease>;

  getState(workerId: EncoderWorkerId): EncoderWorkerState;

  getIdentity(workerId: EncoderWorkerId):
    EncoderWorkerRuntimeIdentity | null;

  health(workerId: EncoderWorkerId): Promise<WorkerHealthReceipt>;

  disposeWorker(workerId: EncoderWorkerId, reason: string): Promise<void>;

  receiptSnapshot(): EncoderWorkerBrokerReceipt;
}
```

## 11.3 Lease 규칙

- Worker Instance는 Broker가 소유한다.
- Lease는 `terminate()`를 노출하지 않는다.
- Lease는 `onmessage` 대입을 노출하지 않는다.
- Listener는 Broker Multiplexer에 등록한다.
- 같은 Worker ID를 여러 호출자가 acquire할 수 있다.
- 실제 Worker Instance는 `maxInstances: 1`에 따라 공유한다.
- 마지막 Lease가 release돼도 즉시 terminate하지 않는다.
- Runtime Dispose 또는 명시적 disposeWorker에서만 종료한다.

Idle Termination은 후속 명세 범위다.

---

# 12. Worker 상태 머신

```text
UNREGISTERED
→ DECLARED
→ VERIFYING_ARTIFACTS
→ VERIFIED
→ SPAWNING
→ HANDSHAKING
→ READY
→ ACTIVE
→ DISPOSING
→ DISPOSED
```

실패 상태:

```text
VERIFYING_ARTIFACTS
→ ARTIFACT_REJECTED

SPAWNING
→ SPAWN_FAILED

HANDSHAKING
→ PROTOCOL_REJECTED

READY / ACTIVE
→ EPOCH_STALE

모든 활성 상태
→ FAILED
```

## 12.1 READY 정의

다음이 모두 참일 때만 READY다.

- Worker Entry Artifact 검증 성공
- Worker 생성 성공
- HELLO 전송 성공
- READY 수신
- Worker ID 일치
- Runtime Epoch 일치
- Worker Epoch 일치
- Control Protocol Version 일치
- Codec Protocol Version 일치
- Build ID 일치
- Worker Artifact Set Digest 일치
- 필수 WASM 초기화 성공

`new Worker()`가 성공한 것만으로 READY가 아니다.

## 12.2 ACTIVE 정의

최소 한 개의 Lease가 Worker를 사용 중인 READY 상태다.

## 12.3 FAILED 정의

Worker가 실패하면 해당 Worker-backed Encoder는 `eligible=false`로 전환한다.

단, R7 Encoder Set Digest가 Runtime Epoch 중 바뀌는 것은 허용하지 않는다.

따라서 Worker가 Epoch 중 실패하면:

```text
Encoder Identity 유지
→ Health = FAILED
→ Export 요청 Fail-Closed
→ 새로운 Encoder Set으로 조용히 교체 금지
```

---

# 13. Legacy Bridge

## 13.1 전역 Bridge

레거시 ExportManager가 사용할 유일한 Worker Bridge:

```ts
window.DadumRuntimeWorkerBridge
```

타입:

```ts
interface DadumRuntimeWorkerBridge {
  acquireEncoderWorker(
    workerId: string,
  ): Promise<LegacyEncoderWorkerClient>;

  getEncoderWorkerIdentity(
    workerId: string,
  ): EncoderWorkerRuntimeIdentity | null;
}
```

## 13.2 Legacy Client

```ts
interface LegacyEncoderWorkerClient {
  readonly workerId: string;
  readonly workerEpoch: string;
  readonly codecProtocolVersion: string;

  postMessage(
    message: Record<string, unknown>,
    transfer?: Transferable[],
  ): void;

  addMessageListener(
    listener: (event: MessageEvent) => void,
  ): () => void;

  release(): void;
}
```

## 13.3 레거시 WebP 변경

기존:

```js
const worker = new Worker(
  './encoder_full_worker.js',
  { type: 'module' },
);
```

변경:

```js
const workerClient =
  await window.DadumRuntimeWorkerBridge
    .acquireEncoderWorker(
      'dadum.worker.encoder.webp-lossless-v1',
    );
```

레거시 Pending Map과 Codec 명령은 R1에서 유지 가능하다.

단, Listener는 `worker.onmessage =`가 아니라 Broker Listener를 사용한다.

## 13.4 레거시 PNG16 변경

기존 직접 Worker 생성 제거.

```text
ExportManager Lazy Loader
→ Runtime Worker Bridge acquire
→ Broker-owned PNG16 Worker Lease
```

## 13.5 레거시 PSD 변경

`psd_export_bridge.js`의 `_worker` 전역을 제거한다.

대신:

```text
_workerClient
```

Lease를 보존한다.

`beforeunload` 직접 terminate 코드는 제거한다.

Runtime Dispose가 Worker 종료를 단독 소유한다.

---

# 14. Worker Entry Adapter

## 14.1 공통 Adapter

권장 파일:

```text
app/src/runtime/workers/worker-entry-runtime.ts
```

책임:

- Control Message 판별
- HELLO 검증
- READY 생성
- Runtime Epoch 보존
- Data Message Metadata 검증
- Codec Handler 호출
- Response Metadata Echo
- DISPOSE 처리

## 14.2 Handler 분리

기존 Worker Script의 다음 형태를 제거한다.

```js
self.onmessage = async (event) => {
  // codec logic
};
```

대신:

```js
export async function handleWebpWorkerMessage(
  message,
  context,
) {
  // existing codec logic
}
```

Entry:

```ts
import { createWorkerEntryRuntime } from '../worker-entry-runtime';
import { webpLosslessHandler } from
  '../../../../legacy-runtime/worker-codecs/webp-lossless-handler.js';

createWorkerEntryRuntime({
  workerId: 'dadum.worker.encoder.webp-lossless-v1',
  codecProtocolVersion: 'dadum-webp-lossless-worker-v1',
  handler: webpLosslessHandler,
});
```

---

# 15. Artifact Verification

## 15.1 제품 모드

Broker가 Worker를 생성하기 전에 Worker Manifest의 Artifact를 검증한다.

권장 절차:

```text
Descriptor 조회
→ Artifact URL 목록 정렬
→ 각 Asset Fetch
→ byteLength 검증
→ SHA-256 검증
→ Artifact Set Digest 재계산
→ Manifest Digest 대조
→ Worker Spawn
```

## 15.2 Cache

동일 Build ID와 Artifact URL에 대해 검증 결과를 Runtime Epoch 내에서 캐시할 수 있다.

Cache Key:

```text
buildId
+ workerId
+ workerArtifactSetDigest
```

## 15.3 실패 정책

하나라도 실패하면 Worker를 생성하지 않는다.

```text
E_WORKER_ARTIFACT_FETCH_FAILED
E_WORKER_ARTIFACT_LENGTH_MISMATCH
E_WORKER_ARTIFACT_DIGEST_MISMATCH
E_WORKER_ARTIFACT_SET_MISMATCH
```

## 15.4 Dev Mode

Dev Mode에서 Vite HMR Asset은 안정 SHA-256을 갖기 어렵다.

따라서 Dev Receipt:

```text
artifactVerificationMode = source-graph-only
promotionEligible = false
```

Production Receipt:

```text
artifactVerificationMode = emitted-artifact-sha256
promotionEligible = true
```

---

# 16. Stable Error Codes

다음 오류 코드를 추가한다.

| 코드 | 의미 | 정책 |
|---|---|---|
| `E_WORKER_DESCRIPTOR_MISSING` | Worker ID에 대한 Descriptor 없음 | Fail-Closed |
| `E_WORKER_URL_NOT_AUTHORITATIVE` | URL이 Vite Worker Manifest에 없음 | Fail-Closed |
| `E_WORKER_ORIGIN_MISMATCH` | Worker URL Origin 불일치 | Fail-Closed |
| `E_WORKER_ARTIFACT_FETCH_FAILED` | Artifact Fetch 실패 | Fail-Closed |
| `E_WORKER_ARTIFACT_LENGTH_MISMATCH` | Byte Length 불일치 | Fail-Closed |
| `E_WORKER_ARTIFACT_DIGEST_MISMATCH` | 개별 Artifact SHA-256 불일치 | Fail-Closed |
| `E_WORKER_ARTIFACT_SET_MISMATCH` | Artifact Set Digest 불일치 | Fail-Closed |
| `E_WORKER_SPAWN_FAILED` | Worker Constructor 실패 | Fail-Closed |
| `E_WORKER_HANDSHAKE_REJECTED` | Worker가 HELLO를 거부 | Fail-Closed |
| `E_WORKER_PROTOCOL_MISMATCH` | Control 또는 Codec Protocol 불일치 | Fail-Closed |
| `E_WORKER_BUILD_ID_MISMATCH` | Worker Build ID 불일치 | Fail-Closed |
| `E_WORKER_EPOCH_MISMATCH` | Runtime 또는 Worker Epoch 불일치 | 응답 폐기 + Worker Fail |
| `E_WORKER_IDENTITY_MISMATCH` | Worker ID 불일치 | Fail-Closed |
| `E_WORKER_WASM_INIT_FAILED` | 필수 WASM 초기화 실패 | Fail-Closed |
| `E_WORKER_STALE_MESSAGE_REJECTED` | 이전 Epoch 응답 수신 | 응답 폐기 |
| `E_WORKER_DIRECT_CREATION_FORBIDDEN` | 제품 코드에서 직접 new Worker 발견 | Build Fail |
| `E_WORKER_DIRECT_TERMINATE_FORBIDDEN` | Broker 외 terminate 호출 | Build Fail |
| `E_WORKER_LEASE_INVALID` | 해제된 Lease 사용 | Fail-Closed |

정보 코드:

| 코드 | 의미 |
|---|---|
| `I_WORKER_ARTIFACTS_VERIFIED` | Worker Artifact Set 검증 성공 |
| `I_WORKER_HANDSHAKE_READY` | Worker Handshake 성공 |
| `I_WORKER_LEASE_ACQUIRED` | Worker Lease 획득 |
| `I_WORKER_LEASE_RELEASED` | Worker Lease 반환 |
| `I_WORKER_DISPOSED` | Broker 권위로 Worker 종료 |

---

# 17. Worker Runtime Identity

```ts
export interface EncoderWorkerRuntimeIdentity {
  workerId: string;
  runtimeEpoch: number;
  workerEpoch: string;
  generation: number;

  state: EncoderWorkerState;

  controlProtocolVersion: string;
  codecProtocolVersion: string;

  buildId: string;
  sourceGraphDigest: string;
  entrySourceIdentity: string;
  entryUrl: string;
  entryAssetSha256: string;
  workerArtifactSetDigest: string;

  transferPolicyId: string;
  wasmPolicyId: string;
  legacyCodecHandlerId: string;

  ownerRuntimeEncoderIds: string[];
}
```

Identity는 Worker 객체 자체를 포함하지 않는다.

Pinia에 저장 가능한 것은 다음뿐이다.

```text
workerId
workerEpoch
state
protocolVersion
artifactSetDigest
stableErrorCode
```

Worker Instance는 Runtime Service에만 존재한다.

---

# 18. Receipt

## 18.1 Broker Receipt

```ts
export interface EncoderWorkerBrokerReceipt {
  schema: 'dadum-encoder-worker-broker-receipt-v1';
  runtimeEpoch: number;
  buildId: string;
  workerManifestDigest: string;
  workers: EncoderWorkerRuntimeIdentity[];
  receiptDigest: string;
}
```

## 18.2 Worker Activation Receipt

각 Worker마다:

```json
{
  "workerId": "dadum.worker.encoder.webp-lossless-v1",
  "state": "READY",
  "runtimeEpoch": 17,
  "workerEpoch": "17:dadum.worker.encoder.webp-lossless-v1:1",
  "generation": 1,
  "controlProtocolVersion": "dadum-worker-control-v1",
  "codecProtocolVersion": "dadum-webp-lossless-worker-v1",
  "buildId": "...",
  "entrySourceIdentity": "vite:app/src/runtime/workers/entries/webp-lossless.worker.ts",
  "entryUrl": "/assets/webp-lossless.worker-....js",
  "entryAssetSha256": "...",
  "workerArtifactSetDigest": "...",
  "artifactVerificationMode": "emitted-artifact-sha256",
  "artifactVerified": true,
  "wasmReady": true,
  "ownerRuntimeEncoderIds": [
    "dadum.encoder.webp-lossless.v1"
  ],
  "transferPolicyId": "sab-copy-input-transfer-output-v1",
  "wasmPolicyId": "webp-wasm-worker-only-v1"
}
```

## 18.3 Export Receipt 확장

R7 Export Receipt에 다음을 추가한다.

```text
workerBacked
workerId
workerEpoch
workerProtocolVersion
workerArtifactSetDigest
workerEntryAssetSha256
workerGeneration
workerTransferPolicyId
workerWasmPolicyId
```

Main-thread Encoder는:

```text
workerBacked = false
```

Worker-backed Encoder가 위 필드를 누락하면 Export 성공으로 봉인하지 않는다.

## 18.4 Deterministic Digest

다음은 Receipt Digest에서 제외한다.

- Worker Spawn 시각
- Handshake Duration
- Fetch Duration
- 브라우저 Worker 내부 Thread ID
- 무작위 UUID

다음은 포함한다.

- Worker ID
- Runtime Epoch
- Worker Epoch
- Generation
- Protocol Versions
- Build ID
- Source Identity
- Artifact Digests
- Owner Encoder IDs
- Transfer Policy
- WASM Policy
- Final State

---

# 19. R7 Encoder Registry 결선

`EncoderRegistryService` Descriptor에 다음 필드를 추가한다.

```ts
interface RuntimeEncoderRecord {
  // R7 existing fields
  workerBinding?: {
    workerId: string;
    required: boolean;
    codecProtocolVersion: string;
  };
}
```

예:

```json
{
  "runtimeEncoderId": "dadum.encoder.png16.v1",
  "format": "png16",
  "workerBinding": {
    "workerId": "dadum.worker.encoder.png16-v1",
    "required": true,
    "codecProtocolVersion": "dadum-png16-worker-v1"
  }
}
```

Eligible 계산:

```text
Legacy Exact Descriptor Valid
AND Runtime Encoder Descriptor Valid
AND Worker Descriptor Valid
AND Worker Protocol Match
AND Artifact Manifest Valid
```

Lazy Worker는 부트 시 실제 Spawn하지 않아도 된다.

그러나 부트 시 다음은 검증해야 한다.

- Worker Descriptor 존재
- Artifact Manifest 존재
- Encoder↔Worker ID 결속
- Protocol Version 결속
- Build ID 결속

실제 Artifact Fetch와 Handshake는 첫 Export 전 수행 가능하다.

`eligible`과 `ready`를 분리한다.

```text
eligible
→ 구성상 실행 가능

ready
→ Worker Artifact 검증 + Handshake + WASM Ready 완료
```

Export 시 `ready=false`면 Broker가 realize한다.

---

# 20. 직접 Worker 생성 폐쇄

## 20.1 정적 검사 대상

활성 Source Graph에서 다음을 검색한다.

```text
new Worker(
SharedWorker(
.worker = new Worker
worker = new Worker
```

허용 파일:

```text
app/src/runtime/workers/worker-registry-service.ts
```

또는 최종 설계에 따라:

```text
app/src/runtime/workers/encoder-worker-broker-service.ts
```

둘 중 실제 Constructor 소유 파일 하나만 허용한다.

## 20.2 Legacy Quarantine 제외

다음은 제품 실행 Graph에서 차단된 경우 정적 경고로만 남길 수 있다.

```text
app/legacy-runtime/legacy_quarantine/**
app/legacy-source/**
*.bak*
*.patch
```

그러나 Active Legacy Manifest에 포함된 파일은 예외가 아니다.

## 20.3 직접 terminate 폐쇄

활성 제품 코드에서 `worker.terminate()`는 Broker 내부만 허용한다.

기존:

```text
beforeunload → terminate
```

제거한다.

Renderer unload 시 Runtime Service Container dispose가 Broker를 종료한다.

---

# 21. Transfer Policy

R1은 Transfer 의미를 바꾸지 않지만 명시한다.

## 21.1 WebP

```text
Input
Uint8Array → SharedArrayBuffer 복사
Caller Buffer 생존

Output
Uint8Array Buffer Transfer
Worker Output Buffer Detach
Main Ownership 획득
```

Policy ID:

```text
sab-copy-input-transfer-output-v1
```

## 21.2 PNG16

```text
Input
RGBA16 또는 RGBA8 Buffer Transfer
Caller TypedArray Buffer Detach 가능

Output
PNG Uint8Array Buffer Transfer
```

Policy ID:

```text
transfer-input-transfer-output-v1
```

Call Site는 Transfer 전 입력을 다시 쓰지 않아야 한다.

## 21.3 PSD

```text
Input
Request Bytes Buffer Transfer

Output
PSD Uint8Array Buffer Transfer
```

Policy ID:

```text
transfer-request-transfer-output-v1
```

## 21.4 Receipt

Export Receipt에는 실제 적용 Transfer Policy ID를 기록한다.

향후 Transfer 정책 변경은 Encoder Identity 또는 Worker Protocol Version 변경을 요구한다.

---

# 22. WASM Policy

## 22.1 Worker Realm 보장

Worker-backed Encoder의 WASM Module은 Renderer Main Realm에서 생성되면 안 된다.

다음 Worker의 필수 WASM:

```text
WebP Lossless
→ WebP Emscripten WASM

PNG16
→ LodePNG WASM

PSD Worker Serializer
→ Rust/WASM PSD Exporter
```

Worker READY Payload에:

```text
wasmReady = true
wasmImplementationId
wasmArtifactSha256
```

를 포함한다.

## 22.2 Main Realm Probe

정적 검사와 Runtime Probe로 다음을 확인한다.

```text
Worker-backed WASM Factory의 Main Realm Instance 수 = 0
```

R1에서는 Worker-backed 세 포맷만 대상으로 한다.

JXL과 JPEG는 아직 Main-thread 경로이므로 본 Gate 대상이 아니다.

---

# 23. 보안·격리 계약

- Worker는 `type: 'module'`만 허용한다.
- Same-origin Worker만 허용한다.
- `blob:` Worker URL을 제품 모드에서 금지한다.
- `data:` Worker URL을 금지한다.
- Runtime에서 문자열 코드를 조립해 Worker를 만들지 않는다.
- `importScripts()` 사용을 금지한다.
- Worker 내부 동적 import는 Worker Artifact Manifest에 포함된 URL만 허용한다.
- Worker가 임의 외부 Origin을 fetch하지 않는다.
- WASM URL은 Worker Entry Module Graph 또는 Worker Manifest에 귀속한다.
- Worker Global에 제품 Secret을 전달하지 않는다.

---

# 24. 파일 변경 계획

## 24.1 신규 파일

```text
app/src/runtime/workers/encoder-worker-broker-service.ts
app/src/runtime/workers/encoder-worker-types.ts
app/src/runtime/workers/worker-entry-runtime.ts
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/workers/generated-worker-manifest.json

app/src/runtime/workers/entries/webp-lossless.worker.ts
app/src/runtime/workers/entries/png16.worker.ts
app/src/runtime/workers/entries/psd-export.worker.ts

app/legacy-runtime/worker-codecs/webp-lossless-handler.js
app/legacy-runtime/worker-codecs/png16-handler.js
app/legacy-runtime/worker-codecs/psd-export-handler.js

tools/generate-runtime-worker-manifest.mjs
tools/gate-export-worker-01.mjs
```

## 24.2 수정 파일

```text
app/src/runtime/service-token.ts
app/src/runtime/workers/worker-registry-service.ts
app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
app/src/runtime/receipt-service.ts

app/legacy-runtime/export_manager.js
app/legacy-runtime/libs/psd/psd_export_bridge.js

vite.config.ts
package.json
```

## 24.3 퇴역 또는 Reference 전환

다음 파일은 Handler 추출 후 직접 Entry 권위를 잃는다.

```text
app/legacy-runtime/encoder_full_worker.js
app/legacy-runtime/workers/encode_lodepng16.worker.js
app/legacy-runtime/workers/psd_export.worker.js
```

상태:

```text
deprecated-entry
```

필요하면 Compatibility Wrapper로 유지할 수 있으나 Active Product Graph에서 직접 생성돼서는 안 된다.

---

# 25. 정적 Gate

## GATE-EW01-01 Worker Constructor Ownership

```text
Active Product Graph의 new Worker 호출자 = 정확히 1개
```

PASS:

```text
EncoderWorkerBrokerService 또는 WorkerRegistryService 단일 소유
```

FAIL:

```text
Legacy ExportManager 직접 생성
PSD Bridge 직접 생성
Vue Component 직접 생성
```

## GATE-EW01-02 Vite Worker URL Authority

모든 활성 Worker Entry가:

```text
new URL(..., import.meta.url)
```

또는 승인된 Vite Worker Import로 귀속돼야 한다.

문자열 상대 URL 0개.

## GATE-EW01-03 Worker Descriptor Completeness

Worker-backed Runtime Encoder마다 Descriptor가 정확히 1개 있어야 한다.

## GATE-EW01-04 Encoder↔Worker Ownership

Worker Descriptor의 `ownerRuntimeEncoderIds`와 Encoder Registry의 `workerBinding`이 양방향 일치해야 한다.

## GATE-EW01-05 Control Protocol Version

모든 활성 Worker:

```text
controlProtocolVersion = dadum-worker-control-v1
```

## GATE-EW01-06 Codec Protocol Version

각 Worker와 Encoder Binding의 Codec Protocol Version이 일치해야 한다.

## GATE-EW01-07 Artifact Manifest Closure

각 Worker Artifact가:

- 존재
- byteLength 일치
- sha256 일치
- Artifact Set Digest 일치

해야 한다.

## GATE-EW01-08 Build ID Closure

Boot Build ID와 Worker Manifest Build ID가 일치해야 한다.

## GATE-EW01-09 Runtime Epoch Closure

HELLO와 READY의 Runtime Epoch가 일치해야 한다.

## GATE-EW01-10 Worker Epoch Closure

READY와 Data Reply가 현재 Worker Epoch를 Echo해야 한다.

## GATE-EW01-11 Stale Reply Rejection

이전 Worker Epoch의 Reply 100건을 주입했을 때:

```text
Adopted = 0
Rejected = 100
```

## GATE-EW01-12 Worker WASM Realm

Worker-backed 세 포맷의 필수 WASM Main Realm Instance:

```text
0
```

## GATE-EW01-13 Direct Terminate Closure

Broker 외 `terminate()` 호출 0개.

## GATE-EW01-14 Receipt Identity Closure

Worker-backed Export Receipt에 Worker Identity 필드 누락 0개.

## GATE-EW01-15 Deterministic Worker Manifest

동일 Source Graph에서 Worker Manifest를 100회 생성했을 때:

```text
manifestDigest parity = 100 / 100
```

## GATE-EW01-16 Deterministic Broker Receipt

동일 Fixture에서 Broker Receipt Seal:

```text
receiptDigest parity = 100 / 100
```

## GATE-EW01-17 Legacy Direct Worker Negative Gate

다음 파일에서 `new Worker`가 발견되면 실패한다.

```text
app/legacy-runtime/export_manager.js
app/legacy-runtime/libs/psd/psd_export_bridge.js
```

## GATE-EW01-18 Worker URL 404 Gate

Production Build를 정적 서버로 제공한 뒤 Worker Entry와 Artifact Set URL을 모두 요청한다.

```text
HTTP 2xx = 100%
404 = 0
```

## GATE-EW01-19 Worker Handshake Gate

WebP·PNG16·PSD 세 Worker 모두:

```text
HELLO → READY
```

를 통과해야 한다.

## GATE-EW01-20 Zero False READY

다음 상태에서 Worker READY 발급을 금지한다.

- WASM 초기화 실패
- Artifact Digest 실패
- Protocol 불일치
- Build ID 불일치
- Runtime Epoch 불일치

---

# 26. Runtime Test Matrix

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| EW01-T01 | WebP Worker 최초 acquire | Artifact 검증 후 READY |
| EW01-T02 | PNG16 Worker 최초 acquire | Artifact 검증 후 READY |
| EW01-T03 | PSD Worker 최초 acquire | WASM 초기화 후 READY |
| EW01-T04 | 동일 Worker 두 번 acquire | Worker Instance 1개, Lease 2개 |
| EW01-T05 | Lease 하나 release | Worker 유지 |
| EW01-T06 | Runtime dispose | 모든 Worker terminate |
| EW01-T07 | Worker ID 오타 | `E_WORKER_DESCRIPTOR_MISSING` |
| EW01-T08 | Entry URL 변조 | `E_WORKER_ARTIFACT_DIGEST_MISMATCH` |
| EW01-T09 | WASM 변조 | `E_WORKER_ARTIFACT_DIGEST_MISMATCH` |
| EW01-T10 | Build ID 불일치 | `E_WORKER_BUILD_ID_MISMATCH` |
| EW01-T11 | Control Version 불일치 | `E_WORKER_PROTOCOL_MISMATCH` |
| EW01-T12 | Codec Version 불일치 | `E_WORKER_PROTOCOL_MISMATCH` |
| EW01-T13 | Runtime Epoch 불일치 READY | READY 거부 |
| EW01-T14 | 이전 Worker Epoch Data Reply | 응답 폐기 |
| EW01-T15 | Wrong Worker ID READY | `E_WORKER_IDENTITY_MISMATCH` |
| EW01-T16 | WebP WASM init 실패 | Worker FAILED, Encoder Export Fail |
| EW01-T17 | PNG16 WASM init 실패 | Worker FAILED, Encoder Export Fail |
| EW01-T18 | PSD WASM init 실패 | Worker FAILED, Encoder Export Fail |
| EW01-T19 | Worker URL 404 | Spawn 이전 Fetch Fail |
| EW01-T20 | Cross-origin Worker URL | `E_WORKER_ORIGIN_MISMATCH` |
| EW01-T21 | blob Worker URL | 제품 모드 거부 |
| EW01-T22 | Legacy 직접 Worker 생성 | Build Gate Fail |
| EW01-T23 | Legacy 직접 terminate | Build Gate Fail |
| EW01-T24 | Worker-backed Export Receipt | Worker Identity 필드 완전 |
| EW01-T25 | Main-thread JXL Export | `workerBacked=false` |
| EW01-T26 | Main-thread JPEG Export | `workerBacked=false` |
| EW01-T27 | Main-thread PNG8 Export | `workerBacked=false` |
| EW01-T28 | 동일 Build 100회 Manifest 생성 | Digest 동일 |
| EW01-T29 | 동일 Fixture 100회 Broker Receipt | Digest 동일 |
| EW01-T30 | Worker READY 전 Encode 시도 | READY 완료까지 대기 또는 Fail-Closed |
| EW01-T31 | 해제된 Lease 사용 | `E_WORKER_LEASE_INVALID` |
| EW01-T32 | Worker Data Reply Protocol 누락 | Reply 폐기 |
| EW01-T33 | Worker Artifact 목록 순서 변경 | Canonical Digest 동일 |
| EW01-T34 | Artifact 내용 1byte 변경 | Digest 변경 |
| EW01-T35 | Runtime Epoch 증가 | 이전 Worker 전부 Stale |
| EW01-T36 | HMR Dev Mode | promotionEligible=false |

---

# 27. Promotion Criteria

제품 승격은 다음을 모두 만족해야 한다.

```text
Active Encoder Worker 직접 생성 = 0
Broker 외 Worker terminate = 0
String Worker URL = 0
Worker 404 = 0
Cross-origin Worker = 0
Artifact Digest 불일치 = 0
Protocol 불일치 = 0
Build ID 불일치 = 0
Stale Epoch Reply Adoption = 0
Worker-backed WASM Main Realm Instance = 0
False READY = 0
Worker Identity 없는 Export Receipt = 0
Worker Manifest Digest parity = 100/100
Broker Receipt Digest parity = 100/100
```

Worker별 필수 PASS:

```text
WebP Lossless
→ READY
→ WASM Ready
→ Runtime Epoch PASS
→ Artifact Set PASS

PNG16
→ READY
→ WASM Ready
→ Runtime Epoch PASS
→ Artifact Set PASS

PSD Export
→ READY
→ Rust/WASM Ready
→ Runtime Epoch PASS
→ Artifact Set PASS
```

최종 Marker:

```text
PASS_TDT_EXPORT_WORKER_01_VITE_WORKER_URL_AUTHORITY_ENCODER_WORKER_BROKER_CONTROL_PROTOCOL_RUNTIME_EPOCH_WORKER_ARTIFACT_DIGEST_SEAL
```

---

# 28. Rollback Criteria

다음 중 하나라도 발생하면 R1-R7 베이크본으로 롤백한다.

- Worker-backed Encoder 3개 중 하나가 제품 빌드에서 로드되지 않음
- Worker Broker가 Legacy ExportManager보다 더 많은 False Failure를 유발함
- Worker Artifact Manifest가 Vite Chunk Graph와 불일치
- Worker WASM Asset가 Manifest에서 누락
- Runtime Epoch 전환 후 이전 Worker가 살아남음
- Export Receipt가 Worker Identity를 누락
- Worker Broker가 Pinia에 Worker 객체를 저장
- Legacy 직접 Worker 생성이 남음
- Worker URL이 제품 Build에서 404
- Worker Ready 전에 Encode가 실행됨
- Artifact Verification을 끄지 않으면 제품이 기동하지 못함

Rollback은 Worker Broker 파일만 제거하는 것이 아니다.

다음 계약을 함께 원복한다.

- Runtime Module Dependency
- Encoder Worker Binding
- Legacy Worker Bridge
- Worker Receipt 확장
- Vite Worker Manifest Plugin 확장

---

# 29. 단계별 구현 순서

## Phase 1. Inventory Freeze

- 활성 Worker 3개 확정
- Worker-backed Encoder ID 확정
- 현재 Worker Script와 WASM Graph 기록
- 직접 Worker 생성 위치 Gate 생성

## Phase 2. Worker Entry Adapter

- 공통 Control Plane 구현
- WebP Handler 추출
- PNG16 Handler 추출
- PSD Handler 추출
- 기존 Codec Data Command 유지

## Phase 3. Vite Entry Adoption

- `app/src/runtime/workers/entries/**` 생성
- Worker URL을 Vite Static Graph에 귀속
- Production Build Worker Asset 확인

## Phase 4. Artifact Manifest

- Vite Build Output Chunk Graph 분석
- Worker별 Artifact Set 생성
- SHA-256과 Digest 생성
- Runtime Worker Manifest 출력

## Phase 5. Broker Service

- Descriptor Registry
- Artifact Verification
- Worker Spawn
- HELLO / READY
- Lease Multiplexer
- Runtime Dispose

## Phase 6. Legacy Bridge

- `DadumRuntimeWorkerBridge` 공개
- ExportManager WebP 연결
- ExportManager PNG16 연결
- PSD Bridge 연결
- 직접 Worker 생성 제거
- beforeunload terminate 제거

## Phase 7. Epoch and Receipt

- Worker Epoch 발급
- Data Message Metadata Echo
- Stale Reply Rejection
- Export Receipt Worker Identity 추가
- Broker Receipt 추가

## Phase 8. Gates

- Static Constructor Gate
- URL 404 Gate
- Artifact Digest Gate
- Protocol Gate
- Runtime Epoch Gate
- Deterministic Receipt Gate

---

# 30. 구현 후 권위 구조

```text
Vite Build Graph
→ Runtime Worker Manifest
→ EncoderWorkerBrokerService
→ WorkerRegistryService
→ Verified Worker Entry
→ Control Handshake
→ Codec Handler
→ WASM
```

Legacy Export 흐름:

```text
Legacy ExportManager Exact Encoder
→ DadumRuntimeWorkerBridge
→ Worker Lease
→ Existing Codec Data Command
→ Worker Reply
→ R7 Result Normalization
→ Signature Verification
→ Export Receipt
```

Worker 종료:

```text
Runtime Epoch End
→ ServiceContainer.dispose
→ EncoderWorkerBrokerService.dispose
→ DISPOSE attempt
→ WorkerRegistry terminate
→ Lease invalidation
→ Resource Receipt closure
```

---

# 31. 최종 판정 기준

본 명세가 닫히면 다음 주장을 할 수 있다.

> WebP Lossless, PNG16, PSD Worker는 Vite가 방출한 승인된 Worker Artifact Set으로만 생성되며, 현재 Runtime Epoch와 Protocol Identity가 일치한 Worker만 Export에 참여한다.

아직 다음 주장은 할 수 없다.

> 모든 Encoder가 Worker에 격리됐다.

이유:

```text
JXL
JPEG
PNG8
```

은 후속 Worker Migration 전까지 Main Thread 경로다.

본 명세는 **부분 Worker 구현을 거짓 없이 제품 권위로 승격하는 첫 Worker 봉인**이다.

---

# 32. 후속 명세

```text
TDT-EXPORT-WORKER-02
Unified Encoder RPC /
Job Timeout /
Abort and Cancel /
Crash Restart /
Pending Job Drain /
Worker Generation Recovery Seal
```

그 다음:

```text
TDT-EXPORT-WORKER-03
WebP Lossless and PNG8·16 Worker Promotion /
Semantic Fallback Prohibition /
Transfer Ownership /
Codec Signature E2E Seal
```

```text
TDT-EXPORT-WORKER-04
PSD Rust·WASM Canonical Serializer /
Plane Ownership /
LCMS Boundary /
Peak Memory Budget Seal
```

```text
TDT-EXPORT-WORKER-05
JXL Dedicated Worker Promotion /
RGBA16 Direct Input /
Main-thread WASM Zero Seal
```

```text
TDT-EXPORT-WORKER-06
MODJPEG Dedicated Worker Promotion /
Pthread Health /
RGBA-to-RGB Worker Closure Seal
```

---

# 33. 최종 요약

R7은 Export의 의미를 봉인했다.

```text
무슨 Surface
→ 무슨 Encoder
→ 무슨 Format
→ 무슨 Bytes
```

본 명세는 Worker의 정체성을 봉인한다.

```text
무슨 Worker Entry
→ 무슨 Build
→ 무슨 Protocol
→ 무슨 Runtime Epoch
→ 무슨 JS·WASM Artifact Set
```

승격의 핵심은 Worker를 새로 만드는 데 있지 않다.

```text
레거시 Codec Handler 보존
→ Worker 생성권 회수
→ Vite URL 권위화
→ Control Handshake
→ Epoch 검증
→ Artifact Digest
→ Receipt 결속
```

이 선이 닫히면 Worker는 더 이상 문자열 경로로 불려 나오는 떠돌이 실행체가 아니다.

**빌드와 런타임 양쪽에서 신원이 봉인된 Encoder 실행 단위**가 된다.
