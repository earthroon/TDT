# TDT-EXPORT-WORKER-01 Applied

## Status

```text
SOURCE_BAKED_UNPROMOTED
```

이번 베이크는 R1-R7 본체 위에서 WebP Lossless, PNG16, PSD Export Worker의 생성권과 수명 권위를 신규 Runtime으로 회수한다. 코덱별 데이터 명령과 WASM 구현은 유지하고, Worker URL, Control Handshake, Runtime Epoch, Artifact Set Identity를 공통 Broker 계약으로 결속했다.

## Parent

```text
44_TDT_RUNTIME_SSOT_01_R1_R7_EXACT_API_ENCODER_IDENTITY_FINAL_SURFACE_RECEIPT_SOURCE_BAKED_UNPROMOTED.zip
SHA-256 6d4e8ae8505c1942d2b4e9bc80af73123483d8e9f0ed19acbaed9a3624991cfa
```

## Runtime identity

```text
Build ID                     25944c4f0d4d15b8dda57555
Runtime manifest SHA-256     27c5d2815342469872f5ee6396df82d5dbb4d185b34c7979d2524bf71b6d078a
Worker source manifest       dc78d3ea1966c1f7cac24ed0abd19a2fe7495136e19bd97bd1947712d6edade4
Source tree digest           9965b4c983e498c2392817d1712c239ab081f3f8307565ec6138fa081828b76c
Source bake seal             8cd32e039da7b013afe1ef7af844240b5beae79624506b1d45c247da2c2d90f2
```

## Applied authority line

```text
Vite ?worker&url import
→ generated Worker Manifest
→ WorkerRegistryService raw constructor authority
→ EncoderWorkerBrokerService
→ HELLO / READY control handshake
→ Runtime Epoch + Worker Epoch + Generation
→ Legacy DadumRuntimeWorkerBridge lease
→ existing codec-specific data command
→ Export Receipt Worker evidence
```

Vite의 Worker 탐지는 `new URL()`이 `new Worker()` 표현식 내부에 직접 있을 때만 성립한다. 생성자를 Registry에 단일 귀속하면서 Worker 번들 URL을 보존하기 위해 각 Entry를 `?worker&url`로 명시 Import하고, Registry가 반환 URL로 유일하게 `new Worker()`를 수행하도록 구성했다.

## Promoted Worker identities

| Worker ID | Codec protocol | Runtime encoder owner |
|---|---|---|
| `dadum.worker.encoder.webp-lossless-v1` | `dadum-webp-lossless-worker-v1` | `dadum.encoder.webp-lossless.v1` |
| `dadum.worker.encoder.png16-v1` | `dadum-png16-worker-v1` | `dadum.encoder.png16.v1` |
| `dadum.worker.encoder.psd-export-v1` | `dadum-psd-export-worker-v1` | `dadum.encoder.psd.v1` |

PSD 8-bit Layered JavaScript 경로는 Worker 구현이 아니므로 `workerBacked: false`로 유지한다. PSD Flattened Rust/WASM Serializer만 Broker Worker 증거를 발급한다.

## New runtime surfaces

- `EncoderWorkerBrokerService`
- `DadumRuntimeWorkerBridge`
- `dadum.module.encoder-worker-v1`
- `dadum.encoder.worker-broker` capability
- `dadum-runtime-worker-manifest-v1`
- `dadum-worker-control-v1`

## Control-plane contract

```text
HELLO
READY
REJECT
HEALTH
DISPOSE
DISPOSED
```

`READY`는 Legacy Handler 초기화와 WASM Ready Evidence가 모두 확인된 뒤에만 발급된다. Worker Data Message에는 `workerId`, `runtimeEpoch`, `workerEpoch`, `controlProtocolVersion`, `codecProtocolVersion`, `buildId`, `workerArtifactSetDigest`가 결속된다. 불일치 응답은 Runtime에 채택하지 않는다.

## Source-bake verification

```text
PASS JavaScript/MJS syntax 13 files
PASS strict TypeScript Worker/Broker closure
PASS strict TypeScript Runtime composition/export closure
PASS inherited R1-R7 static gates
PASS GATE-R7-01..15
PASS GATE-EW01-01..20
PASS Broker receipt determinism 100/100
```

## Promotion withheld

이 컨테이너에는 `node_modules`, `vue-tsc`, `vite`가 없다. 따라서 다음은 수행했다고 주장하지 않는다.

- Vite production Worker bundle emission
- Electron Worker E2E
- WebP Lossless WASM encode E2E
- PNG16 LodePNG WASM encode E2E
- PSD Rust/WASM flattened export E2E
- Emitted Worker JS/WASM SHA-256 verification
- Crash restart, timeout, cancel, pending-job closure

현재 Artifact Verification은 `source-graph-only`이며 `promotionEligible: false`다. Crash Restart, Timeout, Cancel은 후속 `TDT-EXPORT-WORKER-02` 범위다.

## Evidence

- `artifacts/runtime/TDT_EXPORT_WORKER_01_FIX_RECEIPT.json`
- `artifacts/runtime/SOURCE_BAKE_FINAL_VERIFY_EXPORT_WORKER_01.txt`
- `app/src/runtime/workers/generated-worker-manifest.json`
- `patches/TDT_EXPORT_WORKER_01_worker_url_authority_broker_protocol_epoch_script_digest.diff`
- `specs/TDT-EXPORT-WORKER-01_WORKER_URL_AUTHORITY_BROKER_PROTOCOL_EPOCH_SCRIPT_DIGEST_SPEC.md`
