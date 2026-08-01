# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R1

## External Build Admission Sidecar /
## Packaged Closure Binding /
## Normal Runtime Composition Qualification Boot /
## PreviewPresenter Public Entry /
## ExportAuthority Public Entry /
## No Direct Kernel Driver Seal

> 상태: 명세 rev.1
> 기준 부모: `61_TDT_RESAMPLE_RUNTIME_01_R9A_P1_PACKAGED_PRODUCT_GRAPH_INSTRUMENTATION_SOURCE_BAKED_AWAITING_PHYSICAL_GPU.zip`
> 부모 번들 SHA-256: `bd6aad16c9ba6a2f49506d44881b20813e04f97fa4f19f638549bcb8663bba37`
> 부모 P1 명세 SHA-256: `73a85965294e99fc14ea549b046fd22f554678e98fb62d38d573c5350995f212`
> 부모 P1 Source Final Receipt SHA-256: `1538493276ae037bfbd8598ab810698411a6fd1dc18f448a99c8084d36aff73a`
> 부모 P1 receipt self SHA-256: `fc3496f45190141655b1bf908ca90533f86e19cfa94f8286c93e083cb222684a`
> 선행 필수: `TDT-BUILD-LOCK-01-R2` Win32 final admission
> 후속 필수: P1-R2 device-loss, P1-R3 evidence lineage, P1-R4 performance·residency, P1-R5 adapter matrix
> 원칙: package bytes 불변, sidecar 외부 귀속, normal composition 재사용, public product entry만 허용, direct kernel driver 0, historical pass carry-forward 0

---

# 0. 목적

R9A-P1은 packaged Electron 진입점과 raw GPU observation infrastructure를 만들었지만, 현재 qualification renderer는 정상 제품 runtime composition을 부팅하지 않는다. 별도 `GpuDeviceAuthorityService`를 생성하고 `runDeltaKStack()`과 `downscaleRGBAWithWGSL()`을 직접 호출한다. 또한 main coordinator는 Build Lock R2 final receipt를 package 내부 경로에서 찾기 때문에, 실제 win-unpacked package에서는 receipt가 존재하지 않으며 receipt를 package에 다시 넣으면 이미 검증한 package bytes가 바뀌는 순환 의존이 생긴다.

P1-R1은 이 두 P0 결함을 동시에 닫는다.

```text
Build Lock R2 admitted win-unpacked package
+ external immutable admission sidecar
→ main-process sidecar child-chain replay
→ current package closure recomputation
→ exact packaged closure binding
→ main-issued qualification boot permit
→ normal Vue shell + bootstrapRenderer
→ normal createRuntimeComposition module activation
→ qualification-only synthetic fixture publication
→ window.DadumPreviewPresenter.requestPresent()
→ window.DadumRuntimeExport.exportFinal()
→ evidence-only host save sink
→ public-entry lineage receipts
→ no-direct-kernel-driver seal
```

P1-R1은 성능 문턱, device-loss 3회, residency plateau, RTX 3080·GTX 950M matrix를 최종 봉인하지 않는다. 그 항목은 부모 P1의 후속 단계로 남긴다.

# 1. 현재 코드에서 직접 확인된 사실

## 1.1 Build Lock receipt 순환 의존

- `app/electron/resample-runtime-r9a-p1/physical-run-coordinator.mjs`는 `packageRoot/artifacts/build-lock-01-r2/win32/TDT_BUILD_LOCK_01_R2_FINAL_ADMISSION_RECEIPT.json`을 요구한다.
- `package.json`의 electron-builder `files`에는 `artifacts/build-lock-01-r2/win32/**`가 포함되지 않는다.
- Build Lock final receipt는 production package A/B parity와 package-lock promotion 이후 생성된다.
- 따라서 receipt를 검증 완료 package 안에 다시 넣으면 `app.asar` 또는 package closure가 바뀐다.

판정: 누락 glob 문제가 아니라 **package identity 순환 의존**이다.

## 1.2 Qualification runtime 우회

- `app/renderer/physical-r9a-p1/product-runtime.mjs`가 `new GpuDeviceAuthorityService()`를 직접 생성한다.
- 같은 파일이 `createDeltaKStack()`과 `runDeltaKStack()`을 직접 import한다.
- `preview-product-driver.mjs`는 위 private runtime을 직접 호출한다.
- `export-product-driver.mjs`는 `downscaleRGBAWithWGSL()`을 직접 import한다.
- qualification page는 정상 `app/src/main.ts`, `bootstrapRenderer()`, `createRuntimeComposition()`을 실행하지 않는다.

판정: canonical resample API는 실행하지만 **정상 제품 authority graph는 실행하지 않는다.**

## 1.3 이미 존재하는 public product entry

Preview public entry:
```ts
window.DadumPreviewPresenter = {
  authority: 'dadum.runtime.preview-presenter-pp01',
  requestPresent(expectedRevision?: number): Promise<void>,
  receiptSnapshot(): unknown,
}
```

Export public entry:
```ts
window.DadumRuntimeExport = {
  authority: 'dadum.runtime.export',
  apiVersion: 1,
  listEncoders(): EncoderDescriptor[],
  exportFinal(request): Promise<ExportResult>,
  getReceipt(receiptId: string): unknown,
  listReceipts(): unknown[],
}
```

P1-R1은 새 Preview·Export bypass API를 만들지 않는다. 위 public entry를 physical qualification의 유일한 Preview·Export 실행 입구로 승격한다.

# 2. 목표와 비목표

## 2.1 목표

- Build Lock R2 final evidence를 package 밖의 external sidecar로 전달한다.
- sidecar의 full child chain과 현재 package closure를 main process가 window 생성 전에 검증한다.
- qualification window가 정상 renderer entry와 정상 runtime module plan을 사용한다.
- qualification-only session은 installed/release/fleet PASS를 가장하지 않는다.
- synthetic fixture가 canonical resample broker와 Surface Registry·Pipeline을 통해 final surface가 된다.
- Preview는 `DadumPreviewPresenter.requestPresent()`를 통해 실행된다.
- Export는 `DadumRuntimeExport.exportFinal()`을 통해 실행된다.
- Export save는 사용자 파일 대신 run-scoped evidence sink로 간다.
- qualification runner와 harness의 private kernel import를 0으로 만든다.
- raw evidence finalizer가 public-entry lineage를 재검증한다.

## 2.2 비목표

- R4·R6 EWA 수학 변경
- R9A single-submit command graph 재설계
- device-loss 3-cycle 최종 봉인
- GPU timestamp performance threshold 최종 봉인
- GPU residency plateau 최종 봉인
- RTX 3080·GTX 950M adapter matrix 최종 봉인
- R10A Production Pointer promotion
- R11A installed runtime PASS
- R13A fleet PASS
- R14A signed distribution PASS

# 3. 권위 모델

```text
Build Lock R2 final admission
= reproducible package build authority

External Build Admission Sidecar
= package 밖에서 Build Lock child chain과 target package closure를 전달하는 transport envelope

Packaged Closure Binding Receipt
= 현재 실행 중인 package bytes가 sidecar target과 동일하다는 main-process authority

Qualification Boot Permit
= 특정 run·window·renderer PID·fixture schedule에만 귀속되는 main-process capability

Normal Runtime Composition
= createRuntimeComposition()이 생성하는 service/module graph SSOT

Qualification Fixture Service
= admitted synthetic fixture를 canonical broker·Surface Registry·Pipeline에 넣는 유일한 fixture authority

Preview public entry
= DadumPreviewPresenter.requestPresent()

Export public entry
= DadumRuntimeExport.exportFinal()

Evidence Save Sink
= ExportAuthority의 정상 host save protocol을 사용하되 run root 밖으로 나갈 수 없는 qualification-only sink
```

## 3.1 비권위

- 환경변수에 적힌 `admitted=true`
- package 파일명 또는 release 폴더명
- TLS·서명되지 않은 launcher log
- renderer가 제출한 package digest
- query string만으로 선택한 qualification mode
- private `runDeltaKStack()` 직접 호출 결과
- private `downscaleRGBAWithWGSL()` 직접 호출 결과
- legacy final-surface bridge를 통한 우회 publication
- Preview·Export 결과의 summary boolean
- 과거 R9A-P1 source PASS carry-forward

# 4. External Build Admission Sidecar

## 4.1 위치

Build Lock R2 Win32 finalizer는 package를 수정하지 않고 package 옆의 외부 evidence directory에 sidecar를 발행한다.

```text
release/
├─ win-unpacked/
│  ├─ DadumDadum.exe
│  └─ resources/app.asar
└─ build-admission/
   └─ <winUnpackedClosureDigest>/
      └─ BLR2_EXTERNAL_ADMISSION_SIDECAR.json
```

sidecar는 다음 위치에 존재할 수 없다.

- `resources/app.asar` 내부
- `win-unpacked` package root 내부
- renderer-writable evidence run root 내부
- user document 또는 temp download directory
- symlink·junction·reparse point를 경유한 경로

## 4.2 launcher 입력

```text
DADUM_BUILD_LOCK_R2_ADMISSION_PATH=<absolute sidecar path>
DADUM_BUILD_LOCK_R2_ADMISSION_SHA256=<64 hex>
DADUM_R9A_P1_R1_RUN_ID=<64 hex>
DADUM_R9A_P1_R1_EVIDENCE_ROOT=<absolute path>
DADUM_R9A_P1_R1_PHYSICAL_MODE=1
```

path와 expected SHA는 launcher에서 main process로만 전달한다. preload와 renderer에는 raw path 또는 sidecar body를 노출하지 않는다.

## 4.3 sidecar schema

```ts
interface BuildLockR2ExternalAdmissionSidecarV1 {
  schemaVersion: 1
  schemaId: 'tdt.build-lock-r2.external-admission-sidecar.v1'
  receiptKind: 'build-lock-r2-external-admission-sidecar'

  sidecarId: string
  buildId: string
  platform: 'win32'
  arch: 'x64'

  finalAdmissionReceipt: BuildLockR2FinalAdmissionReceipt
  childReceipts: Record<BuildLockR2ChildId, unknown>
  childReceiptSha256: Record<BuildLockR2ChildId, string>

  packageClosureManifest: PackagedClosureManifestV2
  winUnpackedClosureDigest: string
  appAsarSha256: string
  mainExecutableSha256: string
  nativeAddonSha256: string
  runtimeManifestSha256: string
  packageContentManifestSha256: string

  packageLockSha256: string
  toolchainProfileSha256: string
  generatedAt: string
  selfSha256: string
}
```

sidecar는 final receipt의 `productionBuildAdmitted=true`만 보지 않는다. root graph, cache, install A/B, lifecycle A/B, native A/B, production build A/B, parity, mutation zero, promotion intent/effect, post-promotion replay의 child self-hash를 모두 재검증한다.

# 5. Canonical Packaged Closure Binding

## 5.1 package root

실행 package root는 `__dirname`이 아니라 다음으로 결정한다.

```text
packageRoot = realpath(dirname(process.execPath))
resourcesRoot = realpath(process.resourcesPath)
appAsarPath = resourcesRoot / 'app.asar'
```

## 5.2 closure row

```ts
interface PackagedClosureRowV2 {
  relativePath: string
  caseFoldedPath: string
  byteLength: number
  sha256: string
  fileClass: 'main-executable' | 'asar' | 'asar-unpacked' | 'electron-runtime' | 'resource' | 'locale' | 'other'
}

interface PackagedClosureManifestV2 {
  schemaVersion: 2
  schemaId: 'tdt.packaged-closure-manifest.r9a-p1-r1.v2'
  platform: 'win32'
  arch: 'x64'
  rootBasename: string
  records: PackagedClosureRowV2[]
  recordCount: number
  closureDigest: string
  selfSha256: string
}
```

## 5.3 canonicalization

- 경로 separator를 `/`로 정규화한다.
- 절대경로와 drive letter는 digest 입력에 넣지 않는다.
- Windows case-insensitive collision을 검사한다.
- `..`, NUL, alternate data stream, reserved device name을 거부한다.
- symlink·junction·reparse point를 거부한다.
- file rows는 canonical relative path로 정렬한다.
- byte length와 SHA-256을 모두 포함한다.
- package 내부 mutable evidence·log directory를 만들지 않는다.
- app.asar와 app.asar.unpacked native addon을 별도 identity로 기록한다.
- closure recomputation 전후 executable이 동일한 file identity인지 확인한다.

## 5.4 binding receipt

```ts
interface R9AP1R1PackagedClosureBindingReceipt {
  schemaVersion: 1
  schemaId: 'tdt.r9a-p1-r1.packaged-closure-binding.v1'
  receiptKind: 'r9a-p1-r1-packaged-closure-binding'

  runId: string
  sidecarSha256: string
  buildLockFinalReceiptSha256: string
  buildLockFinalReceiptSelfSha256: string
  expectedClosureDigest: string
  observedClosureDigest: string

  executableSha256: string
  appAsarSha256: string
  nativeAddonSha256: string
  runtimeManifestSha256: string
  packageContentManifestSha256: string

  packageMutatedDuringRun: false
  sidecarMutatedDuringRun: false
  productionPointerMutated: false
  localActivationPointerMutated: false
  selfSha256: string
}
```

# 6. Launcher와 Main-Process Admission

## 6.1 순서

```text
launcher validates command inputs
→ main reads sidecar bytes once
→ expected sidecar SHA check
→ sidecar self-hash and child replay
→ current package closure recomputation
→ exact closure equality
→ run lock acquisition
→ qualification boot permit issue
→ hidden BrowserWindow creation
→ normal renderer index load
```

window 생성 전에 sidecar 또는 closure가 실패하면 renderer process를 만들지 않는다.

## 6.2 sidecar TOCTOU 방지

- main은 sidecar를 canonical absolute path로 realpath한다.
- file이 regular file인지 확인한다.
- package root와 evidence root의 child path가 아님을 확인한다.
- initial stat identity, byte length, SHA-256을 기록한다.
- 검증은 initial in-memory byte snapshot만 사용한다.
- run completion 직전 sidecar readback SHA를 다시 확인한다.
- initial과 final file identity가 다르면 실패한다.
- 자동 재탐색·최신 sidecar 선택은 금지한다.
- expected SHA mismatch 자동 fallback은 금지한다.
- sidecar mutation 시 partial artifact를 COMMITTED로 바꾸지 않는다.

# 7. Qualification Boot Permit

```ts
interface R9AP1R1QualificationBootPermit {
  schemaVersion: 1
  schemaId: 'tdt.r9a-p1-r1.qualification-boot-permit.v1'
  protocol: 'dadum-r9a-p1-r1-qualification-capability-v1'

  runId: string
  qualificationGeneration: number
  packageClosureDigest: string
  sidecarSha256: string
  buildLockFinalReceiptSha256: string
  fixtureScheduleDigest: string

  windowId: number
  webContentsId: number
  rendererPid: number
  partitionId: 'r9a-p1-r1-qualification'

  allowedOperations: readonly [
    'publish-canonical-fixture',
    'preview-public-present',
    'export-public-final',
    'evidence-save'
  ]

  maximumFixtureCount: number
  allowedExportFormats: readonly ['png']
  evidenceRootDigest: string
  issuedAtMs: number
  expiresAtMs: number
  nonce: string
  permitMac: string
}
```

permit은 main secret으로 MAC되며 renderer가 수정할 수 없다. query string, localStorage, fixture JSON만으로 qualification mode를 활성화할 수 없다.

# 8. Normal Runtime Composition Qualification Boot

## 8.1 정상 renderer entry 사용

기존 qualification 전용 `app/renderer/physical-r9a-p1/index.html`을 active entry에서 제거한다. hidden window는 production build의 정상 renderer index를 로드한다.

```text
dist/renderer/index.html
→ app/src/main.ts
→ Vue App + Pinia
→ bootstrapRenderer()
→ loadAndValidateManifests()
→ createRuntimeComposition()
→ validateAndOrderModules()
→ normal module activation order
→ boot receipt seal
→ qualification runner start
```

## 8.2 동일 composition 불변식

- 정상과 qualification은 같은 `createRuntimeComposition()` 구현을 사용한다.
- 같은 service IDs를 사용한다.
- 같은 runtime manifest와 Active Graph digest를 사용한다.
- 같은 module dependency order를 사용한다.
- PreviewPresenterService와 ExportAuthorityService 인스턴스를 재사용한다.
- 별도 `GpuDeviceAuthorityService` 인스턴스를 만들지 않는다.
- 별도 PipelineService 또는 Surface Registry를 만들지 않는다.
- qualification runner에 service container를 직접 노출하지 않는다.
- normal boot receipt와 qualification extension receipt를 분리한다.
- qualification boot는 normal production readiness 또는 promotability를 주장하지 않는다.

## 8.3 bootstrap 결과

```ts
interface RuntimeBootOutcome {
  runtimeEpoch: number
  terminalState: 'READY' | 'DEGRADED'
  bootReceiptId: string
  bootSealSha256: string
  runtimeManifestSha256: string
  activeGraphDigest: string
  activeModuleIds: readonly string[]
  bootMode: 'normal' | 'r9a-p1-r1-qualification'
  qualificationPermitDigest: string | null
}
```

`bootstrapRenderer()`는 위 sealed outcome을 반환하거나 equivalent read-only readiness promise를 제공한다. qualification runner는 boot outcome이 READY이고 permit digest가 일치한 뒤에만 시작한다.

# 9. Qualification Session과 상위 상태

## 9.1 installed PASS 가장 금지

R9A-P1-R1은 R11A installed final이 나오기 전 단계이므로 qualification window가 `installed-strict PASS`를 주장할 수 없다.

```ts
type RuntimeSessionMode =
  | 'installed-strict'
  | 'source-development'
  | 'packaged-qualification'

interface QualificationSessionEnvelope {
  schemaVersion: 1
  schemaId: 'tdt.resample-runtime.qualification-session.r9a-p1-r1.v1'
  mode: 'packaged-qualification'
  qualificationOnly: true
  installedAdmissionClaimed: false
  normalUserWorkAllowed: false
  runId: string
  qualificationGeneration: number
  packageContentId: string
  packageClosureDigest: string
  sidecarSha256: string
  windowId: number
  webContentsId: number
  rendererPid: number
  allowedOperations: readonly ['preview', 'export', 'fixture-publication']
  sessionMac: string
}
```

## 9.2 R12A·R13A·R14A status

normal modules는 활성화되지만 상위 권위는 qualification shadow status를 반환한다.

```text
mode = 'packaged-qualification'
normalWorkAllowed = false
qualificationWorkAllowed = true
installedPassClaimed = false
fleetPassClaimed = false
distributionPassClaimed = false
pointerMutationAllowed = false
```

Preview·Export는 active qualification operation grant가 있을 때만 qualification work를 수행한다. 일반 UI 또는 임의 renderer caller는 동일 window에서도 grant 없이 public API를 사용할 수 없다.

# 10. Canonical Qualification Fixture Publication

## 10.1 qualification public facade

```ts
window.DadumR9AP1Qualification = Object.freeze({
  authority: 'dadum.runtime.r9a-p1-r1-qualification',
  apiVersion: 1,
  publishFixture(request: {
    fixtureId: string
    expectedScheduleDigest: string
  }): Promise<{
    fixtureId: string
    requestId: string
    surfaceId: string
    sourceRevision: number
    finalRevision: number
    pipelineReceiptId: string
    resampleReceiptId: string
    resampleReceiptDigest: string
    publicationSequence: number
  }>,
  receiptSnapshot(): unknown,
})
```

## 10.2 publication path

```text
admitted fixtureId
→ packaged fixture schedule lookup
→ deterministic fixture bytes generation
→ canonical ResampleWorkerBrokerService.execute()
→ canonical executor result
→ Surface Registry owned surface
→ PipelineService.publishFinalCandidate()
→ FinalSurfacePublication
→ public fixture receipt
```

runner는 arbitrary bytes, width, height, kernel ID, shader source, device, pipeline 또는 validation mode를 전달할 수 없다. 모든 fixture parameter는 packaged schedule의 fixture ID로 결정한다.

legacy `DadumRuntimeBridge.publishLegacyFinalSurface()`는 qualification fixture publication에 사용할 수 없다.

# 11. PreviewPresenter Public Entry

qualification runner는 final revision을 받은 뒤 다음만 호출한다.

```ts
await window.DadumPreviewPresenter.requestPresent(finalRevision)
```

필수 검증:

- authority가 `dadum.runtime.preview-presenter-pp01`이다.
- 정상 PreviewPresenterService 인스턴스가 active module owner다.
- canonical preview canvas와 viewport가 normal app shell에 존재한다.
- Final Surface publication과 expectedRevision이 일치한다.
- Preview scheduler가 publication을 소비한다.
- GPU texture direct path 또는 명시적 canonical upload path가 기록된다.
- Preview operation grant가 qualification session과 runId에 결속된다.
- latest preview receipt disposition이 `PRESENTED`이다.
- preview receipt의 surfaceId·finalRevision·resampleReceiptDigest가 publication과 같다.
- FinalSurfaceConsumptionLedger에 `preview` row가 기록된다.

# 12. ExportAuthority Public Entry

qualification runner는 Preview가 같은 final revision을 소비한 뒤 다음만 호출한다.

```ts
const encoders = window.DadumRuntimeExport.listEncoders()
assert(encoders contains canonical PNG encoder)
const result = await window.DadumRuntimeExport.exportFinal({
  format: 'png',
  expectedRevision: finalRevision,
  options: {
    filename: `r9a-p1-r1-${fixtureId}.png`,
    qualificationRunId: runId,
  },
})
```

필수 검증:

- authority가 `dadum.runtime.export`이다.
- apiVersion이 1이다.
- 정상 ExportAuthorityService 인스턴스를 사용한다.
- EncoderRegistry와 EncoderWorkerBroker를 통과한다.
- 같은 Final Surface publication을 pin한다.
- qualification operation grant가 export binding에 결속된다.
- output SHA와 byte length가 worker output·host save receipt와 일치한다.
- ExportReceiptLedger에 receipt가 기록된다.
- FinalSurfaceConsumptionLedger에 `export` row가 기록된다.
- Preview와 Export가 동일 surfaceId·finalRevision·resampleReceiptDigest를 소비한다.

# 13. Evidence-Only Host Save Sink

정상 `HostBridgeService.saveExportBlob()`와 chunked Electron save protocol을 그대로 사용한다. 다만 main-process save authority가 qualification permit을 확인하면 저장 위치를 run-scoped evidence sink로 고정한다.

```text
<evidenceRoot>/<runId>/export-bytes/<fixtureId>.png
```

사용자 save dialog, 임의 경로, Documents/Desktop, overwrite prompt는 사용하지 않는다.

```ts
interface R9AP1R1EvidenceSaveReceipt {
  schemaVersion: 1
  schemaId: 'tdt.r9a-p1-r1.evidence-save-receipt.v1'
  protocol: 'dadum-electron-export-save-v1'
  runId: string
  fixtureId: string
  exportJobId: string
  sessionId: string
  savePathSelectionMode: 'r9a-p1-r1-evidence-sink-v1'
  relativeEvidencePath: string
  byteLength: number
  outputSha256: string
  onDiskSha256: string
  chunkCount: number
  atomicRename: true
  fsync: true
  userPathTouched: false
  selfSha256: string
}
```

# 14. No Direct Kernel Driver Seal

## 14.1 금지 import

- `deltaK_stack_autoEWA.mjs`
- `export_wgsl_downscale.js`
- `createEwaCommandGraphR9A`
- `createDeltaKStack`
- `runDeltaKStack`
- `executeCanonicalEwaLowpassR9A`
- `GpuDeviceAuthorityService` constructor
- `private EWA shader modules`
- `legacy final-surface bridge`
- `raw Surface Registry mutation from qualification runner`

## 14.2 active path

```text
qualification runner
→ DadumR9AP1Qualification.publishFixture
→ ResampleWorkerBrokerService
→ canonical executor
→ Surface Registry
→ Pipeline publication
→ DadumPreviewPresenter.requestPresent
→ DadumRuntimeExport.exportFinal
```

## 14.3 source와 runtime 이중 봉인

- AST/import graph에서 금지 import 0
- Vite emitted graph에서 direct driver chunk 0
- Active Graph에 qualification runner → public facade edge 존재
- public facade → broker/pipeline edge 존재
- Preview public authority ID 일치
- Export public authority ID 일치
- fixture producer ID가 qualification service로 고정
- legacyPromotion evidence가 false
- public-entry event lineage가 raw ledger에 존재
- finalizer가 direct-driver event 또는 missing public-entry lineage를 거부

# 15. Qualification Run State Machine

```text
CREATED
→ SIDECAR_VERIFIED
→ BUILD_LOCK_REPLAYED
→ CLOSURE_BOUND
→ WINDOW_CREATED
→ BOOTING
→ COMPOSITION_READY
→ FIXTURE_PUBLISHED
→ PREVIEW_PRESENTED
→ EXPORT_SAVED
→ DRAINING
→ FINALIZING
→ COMMITTED
```

실패 상태:
```text
REJECTED_SIDECAR
REJECTED_CLOSURE
REJECTED_BOOT
REJECTED_PUBLIC_ENTRY
FAILED
INTERRUPTED
```

state skip, rewind, duplicate terminal transition을 금지한다.

# 16. Raw Evidence와 Finalizer

## 16.1 필수 artifact

- `R9AP1R1_EXTERNAL_BUILD_ADMISSION_SIDECAR_SNAPSHOT.json`
- `R9AP1R1_BUILD_LOCK_CHILD_REPLAY_RECEIPT.json`
- `R9AP1R1_PACKAGED_CLOSURE_MANIFEST.json`
- `R9AP1R1_PACKAGED_CLOSURE_BINDING_RECEIPT.json`
- `R9AP1R1_QUALIFICATION_BOOT_PERMIT_RECEIPT.json`
- `R9AP1R1_NORMAL_RUNTIME_BOOT_RECEIPT.json`
- `R9AP1R1_RUNTIME_COMPOSITION_RECEIPT.json`
- `R9AP1R1_QUALIFICATION_SESSION_RECEIPT.json`
- `R9AP1R1_FIXTURE_PUBLICATION_RECEIPT.json`
- `R9AP1R1_PREVIEW_PUBLIC_ENTRY_RECEIPT.json`
- `R9AP1R1_EXPORT_PUBLIC_ENTRY_RECEIPT.json`
- `R9AP1R1_EXPORT_EVIDENCE_SAVE_RECEIPT.json`
- `R9AP1R1_SHARED_FINAL_SURFACE_TUPLE_RECEIPT.json`
- `R9AP1R1_NO_DIRECT_KERNEL_DRIVER_RECEIPT.json`
- `R9AP1R1_ARTIFACT_MANIFEST.json`
- `TDT_RESAMPLE_RUNTIME_01_R9A_P1_R1_PACKAGED_FINAL_RECEIPT.json`

## 16.2 common envelope

```ts
interface R9AP1R1EvidenceEnvelope {
  schemaVersion: 1
  runId: string
  packageClosureDigest: string
  sidecarSha256: string
  buildLockFinalReceiptSha256: string
  qualificationPermitDigest: string
  fixtureScheduleDigest: string
  runtimeEpoch: number
  qualificationGeneration: number
  sequence: number
  previousDigest: string | null
  payloadDigest: string
  selfSha256: string
}
```

## 16.3 finalizer

Finalizer는 다음을 raw artifact에서 다시 계산한다.

- Build Lock child chain validity
- sidecar initial·final SHA equality
- expected·observed package closure equality
- normal boot module set and order
- qualification session scope
- fixture schedule exact coverage
- broker → Surface Registry → Pipeline lineage
- Preview public authority and presented receipt
- Export public authority and export receipt
- evidence save output/on-disk hash equality
- Preview·Export shared final-surface tuple
- direct private driver count zero
- pointer mutation count zero
- historical pass carry-forward zero

Renderer가 제출한 `normalComposition=true`, `publicEntryPass=true`, `directDriverCount=0` 같은 summary field는 final authority가 아니다.

# 17. Negative-Control Minimum Set

- sidecar를 package 내부에 배치
- sidecar를 evidence root 내부에 배치
- sidecar SHA 환경값 변조
- sidecar self-hash 변조
- Build Lock child receipt 하나 제거
- Build Lock source receipt를 final로 위장
- productionBuildAdmitted boolean만 true로 조작
- package closure row 하나 제거
- app.asar byte 변조
- native addon 교체
- executable 교체
- closure 계산 중 sidecar 교체
- run 중 package byte 변경
- query string만으로 qualification mode 활성화
- 다른 BrowserWindow의 permit 재사용
- 다른 renderer PID의 permit 재사용
- expired permit 사용
- fixture schedule digest 교체
- normal runtime module 하나 skip
- private GpuDeviceAuthorityService 생성
- runDeltaKStack 직접 import
- downscaleRGBAWithWGSL 직접 import
- legacy final-surface bridge 사용
- arbitrary fixture bytes 주입
- fixture ID 중복 실행
- Preview requestPresent 미호출
- Preview expectedRevision 교체
- Preview receipt disposition을 PRESENTED로 위조
- Export listEncoders skip
- Export private method 직접 호출
- Export final revision 교체
- 사용자 save dialog 호출
- evidence root path escape
- host save on-disk hash 불일치
- Preview·Export가 다른 surface 소비
- public entry event 하나 삭제
- direct driver chunk를 emitted graph에 포함
- finalizer에 summary boolean만 제출
- Production Pointer mutation
- Local Activation Pointer mutation

# 18. 구현 표면

## 18.1 신규 권장 파일

- `app/electron/resample-runtime-r9a-p1-r1/external-build-admission-sidecar.mjs`
- `app/electron/resample-runtime-r9a-p1-r1/packaged-closure-binding.mjs`
- `app/electron/resample-runtime-r9a-p1-r1/qualification-boot-authority.mjs`
- `app/electron/resample-runtime-r9a-p1-r1/qualification-save-sink.mjs`
- `app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs`
- `app/src/runtime/qualification/r9a-p1-r1-qualification-service.ts`
- `app/src/runtime/qualification/r9a-p1-r1-qualification-types.ts`
- `app/src/runtime/qualification/r9a-p1-r1-qualification-runner.ts`
- `tools/build-lock-01-r2/emit-external-admission-sidecar.mjs`
- `tools/resample-runtime-01-r9a-p1-r1/finalize-packaged.mjs`
- `tools/resample-runtime-01-r9a-p1-r1/raw-replay.mjs`
- `tools/resample-runtime-01-r9a-p1-r1/verify-no-direct-driver.mjs`

## 18.2 수정 권장 파일

- `electron.mjs`
- `preload.cjs`
- `app/src/env.d.ts`
- `app/src/main.ts`
- `app/src/boot/bootstrap-renderer.ts`
- `app/src/boot/runtime-modules.ts`
- `app/src/runtime/service-token.ts`
- `app/src/runtime/admission/installed-admission-service.ts`
- `app/src/runtime/update/runtime-update-service.ts`
- `app/src/runtime/fleet/fleet-rollout-service.ts`
- `app/src/runtime/distribution/release-distribution-service.ts`
- `app/src/runtime/host-bridge-service.ts`
- `app/src/runtime/preview/preview-presenter-service.ts`
- `app/src/runtime/export/export-authority-service.ts`
- `package.json`

## 18.3 퇴출·격리 대상

- `app/renderer/physical-r9a-p1/product-runtime.mjs`
- `app/renderer/physical-r9a-p1/preview-product-driver.mjs`
- `app/renderer/physical-r9a-p1/export-product-driver.mjs`
- `app/renderer/physical-r9a-p1/index.html`

즉시 삭제가 아니라 active entry와 emitted graph에서 제거한 뒤 quarantine receipt를 남긴다.

# 19. Gate Catalog

게이트는 부모 P1의 360/480 PASS를 carry-forward하지 않는다. P1-R1 전용 source와 packaged gate를 새로 계산한다.

## 19.1 Source Mandatory Gates

### PARENT_LINEAGE_AND_CURRENT_TRUTH

| Gate | Requirement |
|---|---|
| `R9AP1R1-S001` | Parent bundle SHA-256 equals the declared R9A-P1 source bundle digest |
| `R9AP1R1-S002` | Parent P1 spec SHA-256 equals the declared digest |
| `R9AP1R1-S003` | Parent P1 source receipt file SHA-256 equals the declared digest |
| `R9AP1R1-S004` | Parent P1 source receipt self-hash is valid |
| `R9AP1R1-S005` | Parent P1 source state is exact |
| `R9AP1R1-S006` | Parent P1 counts are 360 source PASS and 480 physical PENDING |
| `R9AP1R1-S007` | Historical pass carry-forward is zero |
| `R9AP1R1-S008` | Production Pointer before-image is recorded |
| `R9AP1R1-S009` | Local Activation Pointer before-image is recorded |
| `R9AP1R1-S010` | Current physical coordinator package-internal Build Lock path is detected |
| `R9AP1R1-S011` | Current electron-builder file list omits Build Lock final receipt |
| `R9AP1R1-S012` | Build Lock final receipt post-build timing is documented |
| `R9AP1R1-S013` | Package identity circular dependency is classified as P0 |
| `R9AP1R1-S014` | Current qualification index bypasses normal renderer entry |
| `R9AP1R1-S015` | Current product runtime constructs a private GPU authority |
| `R9AP1R1-S016` | Current preview driver directly imports private product runtime |
| `R9AP1R1-S017` | Current export driver directly imports private downscale API |
| `R9AP1R1-S018` | Existing PreviewPresenter public authority is detected |
| `R9AP1R1-S019` | Existing ExportAuthority public authority is detected |
| `R9AP1R1-S020` | P1-R1 scope excludes device-loss performance residency and adapter matrix finalization |

### SIDECAR_SCHEMA_AND_PATH_AUTHORITY

| Gate | Requirement |
|---|---|
| `R9AP1R1-S021` | External sidecar schema ID is exact |
| `R9AP1R1-S022` | External sidecar receipt kind is exact |
| `R9AP1R1-S023` | External sidecar has a valid self-hash field |
| `R9AP1R1-S024` | External sidecar binds win32 platform |
| `R9AP1R1-S025` | External sidecar binds x64 architecture |
| `R9AP1R1-S026` | External sidecar binds one build ID |
| `R9AP1R1-S027` | External sidecar binds one Build Lock final receipt |
| `R9AP1R1-S028` | External sidecar embeds or references the complete admitted child set |
| `R9AP1R1-S029` | External sidecar binds one package closure manifest |
| `R9AP1R1-S030` | External sidecar binds app.asar SHA-256 |
| `R9AP1R1-S031` | External sidecar binds main executable SHA-256 |
| `R9AP1R1-S032` | External sidecar binds native addon SHA-256 |
| `R9AP1R1-S033` | External sidecar binds runtime manifest SHA-256 |
| `R9AP1R1-S034` | External sidecar binds package content manifest SHA-256 |
| `R9AP1R1-S035` | External sidecar path must be absolute |
| `R9AP1R1-S036` | External sidecar path must be outside package root |
| `R9AP1R1-S037` | External sidecar path must be outside evidence run root |
| `R9AP1R1-S038` | External sidecar path may not traverse a reparse point |
| `R9AP1R1-S039` | External sidecar expected SHA is supplied separately by launcher |
| `R9AP1R1-S040` | External sidecar raw path is not exposed to renderer |

### SIDECAR_CHILD_REPLAY_AND_BUILD_LOCK_AUTHORITY

| Gate | Requirement |
|---|---|
| `R9AP1R1-S041` | Build Lock root graph child is required |
| `R9AP1R1-S042` | Build Lock lock candidate child is required |
| `R9AP1R1-S043` | Build Lock cache closure child is required |
| `R9AP1R1-S044` | Build Lock install A child is required |
| `R9AP1R1-S045` | Build Lock install B child is required |
| `R9AP1R1-S046` | Build Lock lifecycle A child is required |
| `R9AP1R1-S047` | Build Lock lifecycle B child is required |
| `R9AP1R1-S048` | Build Lock install parity child is required |
| `R9AP1R1-S049` | Build Lock native toolchain child is required |
| `R9AP1R1-S050` | Build Lock native build A child is required |
| `R9AP1R1-S051` | Build Lock native build B child is required |
| `R9AP1R1-S052` | Build Lock production build A child is required |
| `R9AP1R1-S053` | Build Lock production build B child is required |
| `R9AP1R1-S054` | Build Lock build parity child is required |
| `R9AP1R1-S055` | Build Lock mutation zero child is required |
| `R9AP1R1-S056` | Build Lock promotion intent child is required |
| `R9AP1R1-S057` | Build Lock promotion effect child is required |
| `R9AP1R1-S058` | Build Lock post-promotion replay child is required |
| `R9AP1R1-S059` | Every Build Lock child self-hash is replayed |
| `R9AP1R1-S060` | Summary-only Build Lock admission is rejected |

### PACKAGED_CLOSURE_MANIFEST

| Gate | Requirement |
|---|---|
| `R9AP1R1-S061` | Canonical package root derives from process executable path |
| `R9AP1R1-S062` | Canonical resources root derives from process resources path |
| `R9AP1R1-S063` | Closure paths use forward slashes |
| `R9AP1R1-S064` | Closure paths are relative and contain no drive letter |
| `R9AP1R1-S065` | Closure paths reject parent traversal |
| `R9AP1R1-S066` | Closure paths reject alternate data streams |
| `R9AP1R1-S067` | Closure paths reject Windows reserved device names |
| `R9AP1R1-S068` | Closure detects case-insensitive path collisions |
| `R9AP1R1-S069` | Closure rejects symlinks |
| `R9AP1R1-S070` | Closure rejects junctions |
| `R9AP1R1-S071` | Closure rejects reparse points |
| `R9AP1R1-S072` | Closure rows include byte length |
| `R9AP1R1-S073` | Closure rows include SHA-256 |
| `R9AP1R1-S074` | Closure rows include file class |
| `R9AP1R1-S075` | Closure rows are canonical-path sorted |
| `R9AP1R1-S076` | Closure record count is explicit |
| `R9AP1R1-S077` | Closure digest covers every row |
| `R9AP1R1-S078` | Closure manifest has a valid self-hash |
| `R9AP1R1-S079` | app.asar is an explicit closure row |
| `R9AP1R1-S080` | Unpacked native addon is an explicit closure row |

### PACKAGED_CLOSURE_BINDING_AND_IMMUTABILITY

| Gate | Requirement |
|---|---|
| `R9AP1R1-S081` | Expected closure digest comes only from verified sidecar |
| `R9AP1R1-S082` | Observed closure digest is recomputed by main process |
| `R9AP1R1-S083` | Expected and observed closure digests must match exactly |
| `R9AP1R1-S084` | Expected and observed app.asar hashes must match |
| `R9AP1R1-S085` | Expected and observed executable hashes must match |
| `R9AP1R1-S086` | Expected and observed native addon hashes must match |
| `R9AP1R1-S087` | Expected and observed runtime manifest hashes must match |
| `R9AP1R1-S088` | Expected and observed package content manifest hashes must match |
| `R9AP1R1-S089` | Closure comparison uses exact row set equality |
| `R9AP1R1-S090` | Extra package file fails closure binding |
| `R9AP1R1-S091` | Missing package file fails closure binding |
| `R9AP1R1-S092` | Changed byte length fails closure binding |
| `R9AP1R1-S093` | Changed file hash fails closure binding |
| `R9AP1R1-S094` | Package closure is recomputed before window creation |
| `R9AP1R1-S095` | Package closure is recomputed at run finalization |
| `R9AP1R1-S096` | Initial and final package closures must match |
| `R9AP1R1-S097` | Sidecar is rehashed at run finalization |
| `R9AP1R1-S098` | Initial and final sidecar hashes must match |
| `R9AP1R1-S099` | Closure binding receipt is main-process authored |
| `R9AP1R1-S100` | Renderer cannot write closure binding receipt |

### LAUNCHER_MAIN_PROCESS_ADMISSION

| Gate | Requirement |
|---|---|
| `R9AP1R1-S101` | Launcher requires explicit physical mode |
| `R9AP1R1-S102` | Launcher requires a 64-hex run ID |
| `R9AP1R1-S103` | Launcher requires an absolute evidence root |
| `R9AP1R1-S104` | Launcher requires an absolute sidecar path |
| `R9AP1R1-S105` | Launcher requires expected sidecar SHA-256 |
| `R9AP1R1-S106` | Launcher does not auto-select newest sidecar |
| `R9AP1R1-S107` | Main verifies packaged Electron mode |
| `R9AP1R1-S108` | Main rejects dev-server URL |
| `R9AP1R1-S109` | Main acquires exclusive run lock before window creation |
| `R9AP1R1-S110` | Main rejects pre-existing run output directory |
| `R9AP1R1-S111` | Main reads sidecar before renderer process creation |
| `R9AP1R1-S112` | Main verifies sidecar file is regular |
| `R9AP1R1-S113` | Main verifies sidecar path ownership boundaries |
| `R9AP1R1-S114` | Main stores an immutable in-memory sidecar snapshot |
| `R9AP1R1-S115` | Main writes a sidecar snapshot receipt without raw private path |
| `R9AP1R1-S116` | Main writes Build Lock replay receipt |
| `R9AP1R1-S117` | Main writes closure binding receipt |
| `R9AP1R1-S118` | Main refuses renderer launch on any admission failure |
| `R9AP1R1-S119` | Main records process executable identity |
| `R9AP1R1-S120` | Main records exact package root basename without absolute user path |

### QUALIFICATION_BOOT_PERMIT

| Gate | Requirement |
|---|---|
| `R9AP1R1-S121` | Qualification boot permit schema ID is exact |
| `R9AP1R1-S122` | Qualification boot permit protocol is exact |
| `R9AP1R1-S123` | Permit binds run ID |
| `R9AP1R1-S124` | Permit binds qualification generation |
| `R9AP1R1-S125` | Permit binds package closure digest |
| `R9AP1R1-S126` | Permit binds sidecar SHA-256 |
| `R9AP1R1-S127` | Permit binds Build Lock final receipt SHA-256 |
| `R9AP1R1-S128` | Permit binds fixture schedule digest |
| `R9AP1R1-S129` | Permit binds BrowserWindow ID |
| `R9AP1R1-S130` | Permit binds webContents ID |
| `R9AP1R1-S131` | Permit binds renderer PID |
| `R9AP1R1-S132` | Permit binds isolated partition ID |
| `R9AP1R1-S133` | Permit lists exact allowed operations |
| `R9AP1R1-S134` | Permit limits fixture count |
| `R9AP1R1-S135` | Permit limits export formats to canonical PNG for R1 |
| `R9AP1R1-S136` | Permit binds evidence root digest without exposing path |
| `R9AP1R1-S137` | Permit has monotonic issue time |
| `R9AP1R1-S138` | Permit has bounded expiry |
| `R9AP1R1-S139` | Permit has cryptographic nonce |
| `R9AP1R1-S140` | Permit has main-process MAC |

### NORMAL_RUNTIME_COMPOSITION_BOOT

| Gate | Requirement |
|---|---|
| `R9AP1R1-S141` | Qualification window loads normal renderer index |
| `R9AP1R1-S142` | Qualification window does not load the legacy qualification index |
| `R9AP1R1-S143` | Qualification renderer executes app/src/main.ts |
| `R9AP1R1-S144` | Qualification renderer mounts normal Vue application |
| `R9AP1R1-S145` | Qualification renderer installs normal Pinia plugins |
| `R9AP1R1-S146` | Qualification renderer calls bootstrapRenderer |
| `R9AP1R1-S147` | Qualification renderer loads and validates normal manifests |
| `R9AP1R1-S148` | Qualification renderer calls createRuntimeComposition |
| `R9AP1R1-S149` | Qualification renderer uses normal runtime module descriptors |
| `R9AP1R1-S150` | Qualification renderer validates normal module dependency order |
| `R9AP1R1-S151` | Qualification renderer initializes normal service IDs |
| `R9AP1R1-S152` | Qualification renderer activates PreviewPresenterService |
| `R9AP1R1-S153` | Qualification renderer activates ExportAuthorityService |
| `R9AP1R1-S154` | Qualification renderer activates SurfaceRegistryAuthorityService |
| `R9AP1R1-S155` | Qualification renderer activates PipelineService |
| `R9AP1R1-S156` | Qualification renderer activates ResampleWorkerBrokerService |
| `R9AP1R1-S157` | Qualification renderer activates InstalledAdmissionService in explicit qualification mode |
| `R9AP1R1-S158` | Qualification renderer emits the normal boot receipt |
| `R9AP1R1-S159` | Qualification renderer emits a separate qualification extension receipt |
| `R9AP1R1-S160` | Qualification boot does not claim normal production promotability |

### QUALIFICATION_SESSION_AND_OPERATION_GRANTS

| Gate | Requirement |
|---|---|
| `R9AP1R1-S161` | Qualification session mode is packaged-qualification |
| `R9AP1R1-S162` | Qualification session marks qualificationOnly true |
| `R9AP1R1-S163` | Qualification session marks installedAdmissionClaimed false |
| `R9AP1R1-S164` | Qualification session marks normalUserWorkAllowed false |
| `R9AP1R1-S165` | Qualification session binds run ID |
| `R9AP1R1-S166` | Qualification session binds package content ID |
| `R9AP1R1-S167` | Qualification session binds package closure digest |
| `R9AP1R1-S168` | Qualification session binds sidecar SHA-256 |
| `R9AP1R1-S169` | Qualification session binds window identity |
| `R9AP1R1-S170` | Qualification session binds renderer PID |
| `R9AP1R1-S171` | Qualification session allowed operations are exact |
| `R9AP1R1-S172` | Qualification session is main-MAC protected |
| `R9AP1R1-S173` | Preview grant binds qualification session |
| `R9AP1R1-S174` | Export grant binds qualification session |
| `R9AP1R1-S175` | Fixture publication grant binds qualification session |
| `R9AP1R1-S176` | Grant binding includes final revision where applicable |
| `R9AP1R1-S177` | Grant binding includes fixture ID |
| `R9AP1R1-S178` | Grant expiry is bounded |
| `R9AP1R1-S179` | Grant replay is rejected |
| `R9AP1R1-S180` | Qualification grants cannot authorize normal user UI work |

### FIXTURE_PUBLICATION_SERVICE

| Gate | Requirement |
|---|---|
| `R9AP1R1-S181` | Qualification facade authority ID is exact |
| `R9AP1R1-S182` | Qualification facade API version is exact |
| `R9AP1R1-S183` | Qualification facade is exposed only in qualification mode |
| `R9AP1R1-S184` | Fixture request accepts fixture ID only |
| `R9AP1R1-S185` | Fixture request accepts expected schedule digest |
| `R9AP1R1-S186` | Fixture request rejects arbitrary shader input |
| `R9AP1R1-S187` | Fixture request rejects arbitrary device input |
| `R9AP1R1-S188` | Fixture request rejects arbitrary kernel ID |
| `R9AP1R1-S189` | Fixture request rejects arbitrary dimensions outside schedule |
| `R9AP1R1-S190` | Fixture request rejects arbitrary byte payload |
| `R9AP1R1-S191` | Fixture schedule is packaged and hashed |
| `R9AP1R1-S192` | Fixture bytes are generated deterministically |
| `R9AP1R1-S193` | Fixture service uses ResampleWorkerBrokerService |
| `R9AP1R1-S194` | Fixture service uses the canonical registered executor |
| `R9AP1R1-S195` | Canonical result includes surface ID |
| `R9AP1R1-S196` | Canonical result includes resample receipt identity |
| `R9AP1R1-S197` | Fixture service publishes through PipelineService |
| `R9AP1R1-S198` | Fixture service records final revision |
| `R9AP1R1-S199` | Fixture service records publication sequence |
| `R9AP1R1-S200` | Legacy final-surface bridge is not used |

### PREVIEW_PUBLIC_ENTRY

| Gate | Requirement |
|---|---|
| `R9AP1R1-S201` | Preview qualification caller uses window.DadumPreviewPresenter |
| `R9AP1R1-S202` | Preview authority equals dadum.runtime.preview-presenter-pp01 |
| `R9AP1R1-S203` | Preview caller invokes requestPresent |
| `R9AP1R1-S204` | Preview caller supplies expected final revision |
| `R9AP1R1-S205` | Preview caller does not access PreviewPresenterService instance |
| `R9AP1R1-S206` | Preview caller does not create WebGPU canvas context directly |
| `R9AP1R1-S207` | Preview caller does not create GPU device directly |
| `R9AP1R1-S208` | Preview uses canonical app-shell canvas |
| `R9AP1R1-S209` | Preview uses canonical viewport |
| `R9AP1R1-S210` | Preview scheduler consumes current final publication |
| `R9AP1R1-S211` | Preview operation grant is issued |
| `R9AP1R1-S212` | Preview grant binds surface and revision |
| `R9AP1R1-S213` | Preview receipt disposition must be PRESENTED |
| `R9AP1R1-S214` | Preview receipt binds surface ID |
| `R9AP1R1-S215` | Preview receipt binds final revision |
| `R9AP1R1-S216` | Preview receipt binds resample receipt digest |
| `R9AP1R1-S217` | Preview receipt binds device epoch |
| `R9AP1R1-S218` | Preview consumption ledger row is required |
| `R9AP1R1-S219` | Preview public-entry receipt is self-hashed |
| `R9AP1R1-S220` | Preview public-entry receipt is main-finalizer replayable |

### EXPORT_PUBLIC_ENTRY

| Gate | Requirement |
|---|---|
| `R9AP1R1-S221` | Export qualification caller uses window.DadumRuntimeExport |
| `R9AP1R1-S222` | Export authority equals dadum.runtime.export |
| `R9AP1R1-S223` | Export API version equals 1 |
| `R9AP1R1-S224` | Export caller invokes listEncoders before export |
| `R9AP1R1-S225` | Canonical PNG encoder availability is verified |
| `R9AP1R1-S226` | Export caller invokes exportFinal |
| `R9AP1R1-S227` | Export caller supplies expected final revision |
| `R9AP1R1-S228` | Export caller does not access ExportAuthorityService instance |
| `R9AP1R1-S229` | Export caller does not call private encoder registry |
| `R9AP1R1-S230` | Export caller does not call private downscale function |
| `R9AP1R1-S231` | Export operation grant is issued |
| `R9AP1R1-S232` | Export grant binds surface and revision |
| `R9AP1R1-S233` | Export uses EncoderRegistryService |
| `R9AP1R1-S234` | Export uses EncoderWorkerBrokerService |
| `R9AP1R1-S235` | Export pins canonical final surface |
| `R9AP1R1-S236` | Export receipt binds output SHA-256 |
| `R9AP1R1-S237` | Export receipt binds output byte length |
| `R9AP1R1-S238` | Export receipt ledger row is required |
| `R9AP1R1-S239` | Export consumption ledger row is required |
| `R9AP1R1-S240` | Export public-entry receipt is self-hashed |

### EVIDENCE_SAVE_SINK

| Gate | Requirement |
|---|---|
| `R9AP1R1-S241` | Evidence save uses normal HostBridgeService |
| `R9AP1R1-S242` | Evidence save uses normal chunk protocol |
| `R9AP1R1-S243` | Evidence save requires qualification export grant |
| `R9AP1R1-S244` | Evidence save path is derived only from run root and fixture ID |
| `R9AP1R1-S245` | Evidence save rejects user supplied absolute path |
| `R9AP1R1-S246` | Evidence save rejects parent traversal |
| `R9AP1R1-S247` | Evidence save does not show save dialog |
| `R9AP1R1-S248` | Evidence save does not touch user Documents |
| `R9AP1R1-S249` | Evidence save does not touch Desktop |
| `R9AP1R1-S250` | Evidence save uses exclusive temporary file |
| `R9AP1R1-S251` | Evidence save verifies every chunk hash |
| `R9AP1R1-S252` | Evidence save verifies sequence and offset |
| `R9AP1R1-S253` | Evidence save uses atomic rename |
| `R9AP1R1-S254` | Evidence save fsyncs file |
| `R9AP1R1-S255` | Evidence save fsyncs parent directory |
| `R9AP1R1-S256` | Evidence save recomputes on-disk SHA-256 |
| `R9AP1R1-S257` | Evidence save output and on-disk hashes must match |
| `R9AP1R1-S258` | Evidence save receipt binds export job ID |
| `R9AP1R1-S259` | Evidence save receipt marks userPathTouched false |
| `R9AP1R1-S260` | Evidence save receipt is self-hashed |

### NO_DIRECT_KERNEL_DRIVER

| Gate | Requirement |
|---|---|
| `R9AP1R1-S261` | Qualification runner has zero import of deltaK_stack_autoEWA |
| `R9AP1R1-S262` | Qualification runner has zero import of export_wgsl_downscale |
| `R9AP1R1-S263` | Qualification runner has zero import of createEwaCommandGraphR9A |
| `R9AP1R1-S264` | Qualification runner has zero import of createDeltaKStack |
| `R9AP1R1-S265` | Qualification runner has zero import of runDeltaKStack |
| `R9AP1R1-S266` | Qualification runner has zero import of executeCanonicalEwaLowpassR9A |
| `R9AP1R1-S267` | Qualification runner does not instantiate GpuDeviceAuthorityService |
| `R9AP1R1-S268` | Qualification runner does not import private shader modules |
| `R9AP1R1-S269` | Qualification runner does not mutate Surface Registry directly |
| `R9AP1R1-S270` | Qualification runner does not call legacy final-surface bridge |
| `R9AP1R1-S271` | Legacy product-runtime driver is removed from active entry |
| `R9AP1R1-S272` | Legacy preview-product-driver is removed from active entry |
| `R9AP1R1-S273` | Legacy export-product-driver is removed from active entry |
| `R9AP1R1-S274` | Legacy qualification index is removed from active entry |
| `R9AP1R1-S275` | Vite emitted graph contains no active direct-driver chunk |
| `R9AP1R1-S276` | Active Graph contains qualification runner to public facade edge |
| `R9AP1R1-S277` | Active Graph contains public facade to broker and pipeline edges |
| `R9AP1R1-S278` | Runtime fixture evidence marks legacyPromotion false |
| `R9AP1R1-S279` | Runtime public-entry lineage is recorded |
| `R9AP1R1-S280` | No-direct-driver receipt is self-hashed |

### EVIDENCE_LINEAGE_AND_FINALIZER

| Gate | Requirement |
|---|---|
| `R9AP1R1-S281` | Every artifact uses a common run envelope |
| `R9AP1R1-S282` | Every artifact binds run ID |
| `R9AP1R1-S283` | Every artifact binds package closure digest |
| `R9AP1R1-S284` | Every artifact binds sidecar SHA-256 |
| `R9AP1R1-S285` | Every artifact binds Build Lock final receipt SHA-256 |
| `R9AP1R1-S286` | Every artifact binds qualification permit digest |
| `R9AP1R1-S287` | Every artifact binds fixture schedule digest |
| `R9AP1R1-S288` | Every artifact binds runtime epoch |
| `R9AP1R1-S289` | Every artifact binds qualification generation |
| `R9AP1R1-S290` | Artifact sequence is monotonic |
| `R9AP1R1-S291` | Artifact previous digest chain is continuous |
| `R9AP1R1-S292` | Artifact manifest contains every required artifact |
| `R9AP1R1-S293` | Artifact manifest contains exact byte lengths |
| `R9AP1R1-S294` | Artifact manifest contains exact SHA-256 values |
| `R9AP1R1-S295` | Finalizer replays Build Lock child chain |
| `R9AP1R1-S296` | Finalizer recomputes package closure equality |
| `R9AP1R1-S297` | Finalizer verifies normal module set and order |
| `R9AP1R1-S298` | Finalizer verifies Preview and Export public authority IDs |
| `R9AP1R1-S299` | Finalizer verifies shared final-surface tuple |
| `R9AP1R1-S300` | Finalizer rejects renderer summary booleans |

### NEGATIVE_CONTROLS_AND_FAIL_CLOSED

| Gate | Requirement |
|---|---|
| `R9AP1R1-S301` | Package-internal sidecar negative control fails |
| `R9AP1R1-S302` | Evidence-root sidecar negative control fails |
| `R9AP1R1-S303` | Sidecar SHA mismatch negative control fails |
| `R9AP1R1-S304` | Sidecar child missing negative control fails |
| `R9AP1R1-S305` | Summary-only Build Lock negative control fails |
| `R9AP1R1-S306` | Extra package file negative control fails |
| `R9AP1R1-S307` | Missing package file negative control fails |
| `R9AP1R1-S308` | app.asar mutation negative control fails |
| `R9AP1R1-S309` | Permit window mismatch negative control fails |
| `R9AP1R1-S310` | Permit renderer PID mismatch negative control fails |
| `R9AP1R1-S311` | Expired permit negative control fails |
| `R9AP1R1-S312` | Module skip negative control fails |
| `R9AP1R1-S313` | Direct preview driver import negative control fails |
| `R9AP1R1-S314` | Direct export driver import negative control fails |
| `R9AP1R1-S315` | Legacy final-surface publication negative control fails |
| `R9AP1R1-S316` | Preview public entry omission negative control fails |
| `R9AP1R1-S317` | Export public entry omission negative control fails |
| `R9AP1R1-S318` | User save dialog negative control fails |
| `R9AP1R1-S319` | Shared surface mismatch negative control fails |
| `R9AP1R1-S320` | Pointer mutation negative control fails |

### INTEGRATION_AND_ACTIVE_GRAPH

| Gate | Requirement |
|---|---|
| `R9AP1R1-S321` | Electron main imports the R1 coordinator |
| `R9AP1R1-S322` | Electron main creates qualification window only after admission |
| `R9AP1R1-S323` | Electron main loads normal renderer index |
| `R9AP1R1-S324` | Preload exposes narrow R1 qualification capability |
| `R9AP1R1-S325` | Preload API surface does not expose sidecar path |
| `R9AP1R1-S326` | Preload does not expose Build Lock child bodies |
| `R9AP1R1-S327` | Runtime env typings define qualification capability |
| `R9AP1R1-S328` | Runtime modules register qualification service |
| `R9AP1R1-S329` | Qualification service is inert in normal mode |
| `R9AP1R1-S330` | Qualification service owns no normal user authority |
| `R9AP1R1-S331` | bootstrapRenderer returns or publishes sealed boot outcome |
| `R9AP1R1-S332` | main.ts starts qualification runner only after READY outcome |
| `R9AP1R1-S333` | PreviewPresenter public API remains backward compatible |
| `R9AP1R1-S334` | ExportAuthority public API remains backward compatible |
| `R9AP1R1-S335` | Host save receipt type admits evidence-sink mode |
| `R9AP1R1-S336` | Generated runtime manifest contains qualification module identity |
| `R9AP1R1-S337` | Active Graph contains qualification module node |
| `R9AP1R1-S338` | Active Graph contains no direct driver root |
| `R9AP1R1-S339` | R8A active-required parser still passes |
| `R9AP1R1-S340` | Parent P1 source verifier remains reproducible in isolated tree |

### SOURCE_FINAL_SEAL

| Gate | Requirement |
|---|---|
| `R9AP1R1-S341` | All source schemas exist |
| `R9AP1R1-S342` | All source modules parse |
| `R9AP1R1-S343` | All changed TypeScript transpiles |
| `R9AP1R1-S344` | All source self-tests pass |
| `R9AP1R1-S345` | All static wiring gates pass |
| `R9AP1R1-S346` | All source no-direct-driver gates pass |
| `R9AP1R1-S347` | All negative controls pass |
| `R9AP1R1-S348` | Implementation manifest covers every R1 source file |
| `R9AP1R1-S349` | Implementation manifest digest is recorded |
| `R9AP1R1-S350` | Parent P1 receipt remains byte-identical |
| `R9AP1R1-S351` | Build Lock R2 source receipt remains byte-identical |
| `R9AP1R1-S352` | package-lock.json remains byte-identical |
| `R9AP1R1-S353` | Production Pointer remains byte-identical |
| `R9AP1R1-S354` | Local Activation Pointer remains byte-identical |
| `R9AP1R1-S355` | Package execution is not performed during source bake |
| `R9AP1R1-S356` | Build Lock Win32 admission is not claimed during source bake |
| `R9AP1R1-S357` | Packaged qualification is not claimed during source bake |
| `R9AP1R1-S358` | Source final receipt counts are exact |
| `R9AP1R1-S359` | Source final receipt self-hash is valid |
| `R9AP1R1-S360` | Source final state awaits Build Lock R2 Win32 and packaged qualification |

## 19.2 Packaged Mandatory Gates

### WIN32_ENVIRONMENT_AND_EXTERNAL_SIDECAR

| Gate | Requirement |
|---|---|
| `R9AP1R1-P001` | Run executes on Windows x64 |
| `R9AP1R1-P002` | Run executes from packaged Electron |
| `R9AP1R1-P003` | Dev server is absent |
| `R9AP1R1-P004` | Physical mode is explicit |
| `R9AP1R1-P005` | Run ID is valid 64-hex |
| `R9AP1R1-P006` | Evidence root is absolute |
| `R9AP1R1-P007` | External sidecar path is absolute |
| `R9AP1R1-P008` | External sidecar expected SHA is valid 64-hex |
| `R9AP1R1-P009` | Sidecar path is outside package root |
| `R9AP1R1-P010` | Sidecar path is outside evidence run root |
| `R9AP1R1-P011` | Sidecar is a regular file |
| `R9AP1R1-P012` | Sidecar path has no reparse point |
| `R9AP1R1-P013` | Sidecar initial SHA equals launcher expected SHA |
| `R9AP1R1-P014` | Sidecar self-hash is valid |
| `R9AP1R1-P015` | Sidecar platform is win32 |
| `R9AP1R1-P016` | Sidecar architecture is x64 |
| `R9AP1R1-P017` | Exclusive run lock is acquired |
| `R9AP1R1-P018` | Run output did not pre-exist |
| `R9AP1R1-P019` | Window is not created before sidecar admission |
| `R9AP1R1-P020` | Sidecar raw path is absent from renderer context |

### BUILD_LOCK_CHILD_REPLAY

| Gate | Requirement |
|---|---|
| `R9AP1R1-P021` | Root graph child self-hash passes |
| `R9AP1R1-P022` | Lock candidate child self-hash passes |
| `R9AP1R1-P023` | Cache closure child self-hash passes |
| `R9AP1R1-P024` | Install A child self-hash passes |
| `R9AP1R1-P025` | Install B child self-hash passes |
| `R9AP1R1-P026` | Lifecycle A child self-hash passes |
| `R9AP1R1-P027` | Lifecycle B child self-hash passes |
| `R9AP1R1-P028` | Install parity child self-hash passes |
| `R9AP1R1-P029` | Native toolchain child self-hash passes |
| `R9AP1R1-P030` | Native A child self-hash passes |
| `R9AP1R1-P031` | Native B child self-hash passes |
| `R9AP1R1-P032` | Production build A child self-hash passes |
| `R9AP1R1-P033` | Production build B child self-hash passes |
| `R9AP1R1-P034` | Build parity child self-hash passes |
| `R9AP1R1-P035` | Mutation zero child self-hash passes |
| `R9AP1R1-P036` | Promotion intent child self-hash passes |
| `R9AP1R1-P037` | Promotion effect child self-hash passes |
| `R9AP1R1-P038` | Post-promotion replay child self-hash passes |
| `R9AP1R1-P039` | Final admission self-hash passes |
| `R9AP1R1-P040` | Final admission productionBuildAdmitted is derived from replayed children |

### CLOSURE_RECOMPUTATION

| Gate | Requirement |
|---|---|
| `R9AP1R1-P041` | Observed package root equals executable directory realpath |
| `R9AP1R1-P042` | Observed resources root equals process.resourcesPath realpath |
| `R9AP1R1-P043` | Observed package contains main executable |
| `R9AP1R1-P044` | Observed package contains app.asar |
| `R9AP1R1-P045` | Observed package contains required native addon |
| `R9AP1R1-P046` | Observed package contains runtime manifest |
| `R9AP1R1-P047` | Observed package contains package content manifest |
| `R9AP1R1-P048` | Observed package has no symlink |
| `R9AP1R1-P049` | Observed package has no junction |
| `R9AP1R1-P050` | Observed package has no reparse point |
| `R9AP1R1-P051` | Observed closure has no case-fold collision |
| `R9AP1R1-P052` | Observed closure has no parent traversal path |
| `R9AP1R1-P053` | Observed closure has no alternate data stream path |
| `R9AP1R1-P054` | Observed closure rows are canonical sorted |
| `R9AP1R1-P055` | Observed closure row count is nonzero |
| `R9AP1R1-P056` | Observed closure byte lengths are exact |
| `R9AP1R1-P057` | Observed closure SHA-256 values are exact |
| `R9AP1R1-P058` | Observed app.asar SHA is computed from disk |
| `R9AP1R1-P059` | Observed executable SHA is computed from disk |
| `R9AP1R1-P060` | Observed native addon SHA is computed from disk |

### CLOSURE_BINDING_READBACK

| Gate | Requirement |
|---|---|
| `R9AP1R1-P061` | Observed closure digest equals sidecar expected closure digest |
| `R9AP1R1-P062` | Observed row set equals sidecar row set |
| `R9AP1R1-P063` | Observed app.asar SHA equals sidecar value |
| `R9AP1R1-P064` | Observed executable SHA equals sidecar value |
| `R9AP1R1-P065` | Observed native addon SHA equals sidecar value |
| `R9AP1R1-P066` | Observed runtime manifest SHA equals sidecar value |
| `R9AP1R1-P067` | Observed package content manifest SHA equals sidecar value |
| `R9AP1R1-P068` | Closure binding receipt binds run ID |
| `R9AP1R1-P069` | Closure binding receipt binds sidecar SHA |
| `R9AP1R1-P070` | Closure binding receipt binds Build Lock final receipt SHA |
| `R9AP1R1-P071` | Closure binding receipt is authored before window creation |
| `R9AP1R1-P072` | Package closure is recomputed after renderer completion |
| `R9AP1R1-P073` | Final closure digest equals initial closure digest |
| `R9AP1R1-P074` | Final app.asar SHA equals initial SHA |
| `R9AP1R1-P075` | Final executable SHA equals initial SHA |
| `R9AP1R1-P076` | Final native addon SHA equals initial SHA |
| `R9AP1R1-P077` | Sidecar final SHA equals initial SHA |
| `R9AP1R1-P078` | Package mutation count is zero |
| `R9AP1R1-P079` | Sidecar mutation count is zero |
| `R9AP1R1-P080` | Closure binding receipt self-hash passes |

### QUALIFICATION_WINDOW_AND_PRELOAD

| Gate | Requirement |
|---|---|
| `R9AP1R1-P081` | Qualification BrowserWindow is hidden |
| `R9AP1R1-P082` | Qualification BrowserWindow uses isolated partition |
| `R9AP1R1-P083` | Qualification BrowserWindow uses context isolation |
| `R9AP1R1-P084` | Qualification BrowserWindow disables node integration |
| `R9AP1R1-P085` | Qualification BrowserWindow disables devtools |
| `R9AP1R1-P086` | Qualification BrowserWindow denies arbitrary navigation |
| `R9AP1R1-P087` | Qualification BrowserWindow denies window open |
| `R9AP1R1-P088` | Qualification BrowserWindow loads file URL only |
| `R9AP1R1-P089` | Qualification BrowserWindow loads normal renderer index |
| `R9AP1R1-P090` | Legacy qualification index is not loaded |
| `R9AP1R1-P091` | Qualification preload is the canonical preload |
| `R9AP1R1-P092` | Preload exposes R1 context operation |
| `R9AP1R1-P093` | Preload exposes R1 artifact write operation |
| `R9AP1R1-P094` | Preload exposes R1 memory operation if requested |
| `R9AP1R1-P095` | Preload exposes R1 complete operation |
| `R9AP1R1-P096` | Preload exposes R1 fail operation |
| `R9AP1R1-P097` | Preload does not expose sidecar path |
| `R9AP1R1-P098` | Preload does not expose package root path |
| `R9AP1R1-P099` | Preload binds IPC sender to qualification window |
| `R9AP1R1-P100` | Qualification window close before commit produces interrupted receipt |

### BOOT_PERMIT_AND_SESSION

| Gate | Requirement |
|---|---|
| `R9AP1R1-P101` | Boot permit MAC verifies |
| `R9AP1R1-P102` | Boot permit run ID matches run |
| `R9AP1R1-P103` | Boot permit closure digest matches closure receipt |
| `R9AP1R1-P104` | Boot permit sidecar SHA matches sidecar snapshot |
| `R9AP1R1-P105` | Boot permit Build Lock receipt SHA matches replay receipt |
| `R9AP1R1-P106` | Boot permit schedule digest matches packaged schedule |
| `R9AP1R1-P107` | Boot permit window ID matches sender |
| `R9AP1R1-P108` | Boot permit webContents ID matches sender |
| `R9AP1R1-P109` | Boot permit renderer PID matches sender |
| `R9AP1R1-P110` | Boot permit partition ID is exact |
| `R9AP1R1-P111` | Boot permit is not expired |
| `R9AP1R1-P112` | Boot permit nonce is active |
| `R9AP1R1-P113` | Boot permit operation set is exact |
| `R9AP1R1-P114` | Boot permit maximum fixture count is enforced |
| `R9AP1R1-P115` | Boot permit export format allowlist is enforced |
| `R9AP1R1-P116` | Observed qualification session mode is packaged-qualification |
| `R9AP1R1-P117` | Qualification session is qualification-only |
| `R9AP1R1-P118` | Qualification session does not claim installed PASS |
| `R9AP1R1-P119` | Qualification session MAC verifies |
| `R9AP1R1-P120` | Qualification session replay count is zero |

### NORMAL_RUNTIME_MODULE_ACTIVATION

| Gate | Requirement |
|---|---|
| `R9AP1R1-P121` | Vue app mounts normal App component |
| `R9AP1R1-P122` | Pinia serializable plugin activates |
| `R9AP1R1-P123` | Normal runtime manifest validates |
| `R9AP1R1-P124` | Normal Vite manifest validates |
| `R9AP1R1-P125` | Normal runtime plan validates |
| `R9AP1R1-P126` | Foundation module activates |
| `R9AP1R1-P127` | Host module activates |
| `R9AP1R1-P128` | GPU module activates |
| `R9AP1R1-P129` | Installed admission module activates in qualification mode |
| `R9AP1R1-P130` | Release distribution module activates in qualification mode |
| `R9AP1R1-P131` | Runtime update module activates in qualification mode |
| `R9AP1R1-P132` | Fleet rollout module activates in qualification mode |
| `R9AP1R1-P133` | Surface Registry module activates |
| `R9AP1R1-P134` | Resample broker module activates |
| `R9AP1R1-P135` | Pipeline module activates |
| `R9AP1R1-P136` | Preview module activates |
| `R9AP1R1-P137` | Export module activates |
| `R9AP1R1-P138` | Normal boot receipt is sealed |
| `R9AP1R1-P139` | Boot outcome terminal state is READY |
| `R9AP1R1-P140` | Boot outcome permit digest matches main permit |

### QUALIFICATION_STATUS_OVERLAYS

| Gate | Requirement |
|---|---|
| `R9AP1R1-P141` | R11A status mode is packaged-qualification |
| `R9AP1R1-P142` | R11A installed PASS claim is false |
| `R9AP1R1-P143` | R12A status mode is packaged-qualification |
| `R9AP1R1-P144` | R12A normal work allowed is false |
| `R9AP1R1-P145` | R12A qualification work allowed is true |
| `R9AP1R1-P146` | R12A update transaction is absent |
| `R9AP1R1-P147` | R13A status mode is packaged-qualification |
| `R9AP1R1-P148` | R13A fleet execution performed is false |
| `R9AP1R1-P149` | R13A containment state does not block qualification |
| `R9AP1R1-P150` | R14A status mode is packaged-qualification |
| `R9AP1R1-P151` | R14A distribution PASS claim is false |
| `R9AP1R1-P152` | R14A qualification package admitted is true through closure binding |
| `R9AP1R1-P153` | Production Pointer mutation permission is false |
| `R9AP1R1-P154` | Local Activation Pointer mutation permission is false |
| `R9AP1R1-P155` | Normal UI work remains blocked |
| `R9AP1R1-P156` | Only qualification fixture publication grant is allowed |
| `R9AP1R1-P157` | Only qualification preview grant is allowed |
| `R9AP1R1-P158` | Only qualification export grant is allowed |
| `R9AP1R1-P159` | Qualification grant expiry is enforced |
| `R9AP1R1-P160` | Qualification grant single-use is enforced |

### FIXTURE_PUBLICATION_PRODUCT_PATH

| Gate | Requirement |
|---|---|
| `R9AP1R1-P161` | Qualification facade authority is exact |
| `R9AP1R1-P162` | Observed qualification facade API version is exact |
| `R9AP1R1-P163` | Qualification facade receives admitted fixture ID |
| `R9AP1R1-P164` | Fixture schedule digest matches permit |
| `R9AP1R1-P165` | Fixture ID exists in packaged schedule |
| `R9AP1R1-P166` | Fixture ID has not already been consumed beyond schedule policy |
| `R9AP1R1-P167` | Deterministic fixture bytes digest matches expected fixture digest |
| `R9AP1R1-P168` | Resample request ID is deterministic and run-bound |
| `R9AP1R1-P169` | Resample request runtime epoch matches boot epoch |
| `R9AP1R1-P170` | Resample broker authority is exact |
| `R9AP1R1-P171` | Canonical executor registration count is one |
| `R9AP1R1-P172` | Canonical executor returns canonical WebGPU result |
| `R9AP1R1-P173` | Canonical result actual identity digest verifies |
| `R9AP1R1-P174` | Canonical result receipt digest verifies |
| `R9AP1R1-P175` | Canonical result surface ID exists in Surface Registry |
| `R9AP1R1-P176` | Canonical result allows final publication |
| `R9AP1R1-P177` | Pipeline publishes final candidate |
| `R9AP1R1-P178` | Final publication source revision is exact |
| `R9AP1R1-P179` | Final publication resample receipt identity is exact |
| `R9AP1R1-P180` | Legacy final-surface bridge invocation count is zero |

### PREVIEW_PUBLIC_ENTRY_EXECUTION

| Gate | Requirement |
|---|---|
| `R9AP1R1-P181` | Preview public authority exists |
| `R9AP1R1-P182` | Preview public authority ID is exact |
| `R9AP1R1-P183` | Preview requestPresent is called exactly once per scheduled preview fixture |
| `R9AP1R1-P184` | Preview request expected revision equals fixture publication revision |
| `R9AP1R1-P185` | Preview operation grant is issued by qualification session |
| `R9AP1R1-P186` | Preview operation grant binding digest verifies |
| `R9AP1R1-P187` | Preview scheduler receives publication |
| `R9AP1R1-P188` | Preview scheduler reaches idle after request |
| `R9AP1R1-P189` | Preview canvas is canonical app-shell canvas |
| `R9AP1R1-P190` | Preview viewport is canonical app-shell viewport |
| `R9AP1R1-P191` | Preview canvas WebGPU context exists |
| `R9AP1R1-P192` | Preview acquires GPU lease through normal GpuService |
| `R9AP1R1-P193` | Preview does not create a private GPU authority |
| `R9AP1R1-P194` | Preview pins exact final surface |
| `R9AP1R1-P195` | Preview final surface device binding is current |
| `R9AP1R1-P196` | Preview presentation command submits |
| `R9AP1R1-P197` | Preview operation completes through admission authority |
| `R9AP1R1-P198` | Preview output is not read back by runner |
| `R9AP1R1-P199` | Preview private driver invocation count is zero |
| `R9AP1R1-P200` | Preview public-entry execution receipt is present |

### PREVIEW_RECEIPT_AND_CONSUMPTION

| Gate | Requirement |
|---|---|
| `R9AP1R1-P201` | Preview latest receipt exists |
| `R9AP1R1-P202` | Preview receipt disposition is PRESENTED |
| `R9AP1R1-P203` | Preview receipt surface ID equals publication surface ID |
| `R9AP1R1-P204` | Preview receipt source revision equals publication source revision |
| `R9AP1R1-P205` | Preview receipt final revision equals publication final revision |
| `R9AP1R1-P206` | Preview receipt pipeline receipt ID equals publication value |
| `R9AP1R1-P207` | Preview receipt resample receipt ID equals publication value |
| `R9AP1R1-P208` | Preview receipt resample receipt digest equals publication value |
| `R9AP1R1-P209` | Preview receipt publication sequence equals publication value |
| `R9AP1R1-P210` | Preview receipt runtime epoch equals boot epoch |
| `R9AP1R1-P211` | Preview receipt presenter generation is positive |
| `R9AP1R1-P212` | Preview receipt device epoch is current |
| `R9AP1R1-P213` | Preview receipt device identity is current |
| `R9AP1R1-P214` | Preview receipt stable error code is null |
| `R9AP1R1-P215` | Preview receipt uploaded bytes policy is valid |
| `R9AP1R1-P216` | Preview receipt row padding is valid |
| `R9AP1R1-P217` | Preview consumption ledger contains one matching row |
| `R9AP1R1-P218` | Preview consumption tuple digest verifies |
| `R9AP1R1-P219` | Preview public-entry receipt self-hash verifies |
| `R9AP1R1-P220` | Preview cleanup releases final-surface pin |

### EXPORT_PUBLIC_ENTRY_EXECUTION

| Gate | Requirement |
|---|---|
| `R9AP1R1-P221` | Export public authority exists |
| `R9AP1R1-P222` | Export public authority ID is exact |
| `R9AP1R1-P223` | Export API version is exact |
| `R9AP1R1-P224` | Export listEncoders is called |
| `R9AP1R1-P225` | Canonical PNG encoder is available |
| `R9AP1R1-P226` | Export exportFinal is called exactly once per scheduled export fixture |
| `R9AP1R1-P227` | Export expected revision equals fixture publication revision |
| `R9AP1R1-P228` | Export operation grant is issued by qualification session |
| `R9AP1R1-P229` | Export operation grant binding digest verifies |
| `R9AP1R1-P230` | Export pins exact final surface |
| `R9AP1R1-P231` | Export reads final surface through normal authority |
| `R9AP1R1-P232` | Export uses normal encoder registry |
| `R9AP1R1-P233` | Export uses normal encoder worker broker |
| `R9AP1R1-P234` | Export worker evidence reports worker-backed true |
| `R9AP1R1-P235` | Export output byte length is positive |
| `R9AP1R1-P236` | Export output SHA-256 is valid |
| `R9AP1R1-P237` | Export operation completes through admission authority |
| `R9AP1R1-P238` | Export private downscale driver invocation count is zero |
| `R9AP1R1-P239` | Export receipt ledger contains result receipt |
| `R9AP1R1-P240` | Export public-entry execution receipt is present |

### EXPORT_EVIDENCE_SAVE

| Gate | Requirement |
|---|---|
| `R9AP1R1-P241` | Host save runs through HostBridgeService |
| `R9AP1R1-P242` | Host save begins with qualification grant |
| `R9AP1R1-P243` | Host save mode is r9a-p1-r1-evidence-sink-v1 |
| `R9AP1R1-P244` | Host save target is inside run-scoped evidence root |
| `R9AP1R1-P245` | Host save target path has no traversal |
| `R9AP1R1-P246` | Host save does not show user dialog |
| `R9AP1R1-P247` | Host save does not touch user path |
| `R9AP1R1-P248` | Host save expected byte length equals blob size |
| `R9AP1R1-P249` | Host save expected SHA equals export output SHA |
| `R9AP1R1-P250` | Every chunk sequence is contiguous |
| `R9AP1R1-P251` | Every chunk offset is contiguous |
| `R9AP1R1-P252` | Every chunk SHA verifies |
| `R9AP1R1-P253` | Host save commit uses atomic rename |
| `R9AP1R1-P254` | Host save commit fsyncs file |
| `R9AP1R1-P255` | Host save commit fsyncs parent directory |
| `R9AP1R1-P256` | On-disk byte length equals output byte length |
| `R9AP1R1-P257` | On-disk SHA equals output SHA |
| `R9AP1R1-P258` | Host save receipt binds export job ID |
| `R9AP1R1-P259` | Host save receipt self-hash verifies |
| `R9AP1R1-P260` | Host save temporary file count is zero after commit |

### SHARED_FINAL_SURFACE_TUPLE

| Gate | Requirement |
|---|---|
| `R9AP1R1-P261` | Preview and Export use the same surface ID |
| `R9AP1R1-P262` | Preview and Export use the same source revision |
| `R9AP1R1-P263` | Preview and Export use the same final revision |
| `R9AP1R1-P264` | Preview and Export use the same pipeline receipt ID |
| `R9AP1R1-P265` | Preview and Export use the same resample receipt ID |
| `R9AP1R1-P266` | Preview and Export use the same resample receipt digest |
| `R9AP1R1-P267` | Preview and Export use the same publication sequence |
| `R9AP1R1-P268` | Preview and Export bind the same runtime epoch |
| `R9AP1R1-P269` | Preview and Export bind the same qualification generation |
| `R9AP1R1-P270` | Preview and Export bind the same fixture ID |
| `R9AP1R1-P271` | Preview and Export grants bind the same final tuple |
| `R9AP1R1-P272` | Consumption ledger has both preview and export rows |
| `R9AP1R1-P273` | Consumption ledger tuple digests verify |
| `R9AP1R1-P274` | No second final surface is published between preview and export |
| `R9AP1R1-P275` | No stale final revision is accepted |
| `R9AP1R1-P276` | No compatibility bytes surface is admitted |
| `R9AP1R1-P277` | No legacy promotion surface is admitted |
| `R9AP1R1-P278` | Shared tuple receipt is main-finalizer authored |
| `R9AP1R1-P279` | Shared tuple receipt self-hash verifies |
| `R9AP1R1-P280` | Shared tuple mismatch count is zero |

### NO_DIRECT_DRIVER_RUNTIME_PROVENANCE

| Gate | Requirement |
|---|---|
| `R9AP1R1-P281` | Qualification runner emitted module has no private kernel import |
| `R9AP1R1-P282` | Qualification runner emitted module has no private downscale import |
| `R9AP1R1-P283` | Qualification runner emitted module has no private command graph import |
| `R9AP1R1-P284` | Qualification runner emitted module has no GPU authority constructor import |
| `R9AP1R1-P285` | Legacy product-runtime module is not loaded |
| `R9AP1R1-P286` | Legacy preview-product-driver module is not loaded |
| `R9AP1R1-P287` | Legacy export-product-driver module is not loaded |
| `R9AP1R1-P288` | Packaged renderer does not load legacy qualification index |
| `R9AP1R1-P289` | Private GPU authority instance count created by runner is zero |
| `R9AP1R1-P290` | Direct runDeltaKStack call count from runner is zero |
| `R9AP1R1-P291` | Direct downscaleRGBAWithWGSL call count from runner is zero |
| `R9AP1R1-P292` | Legacy final-surface bridge call count is zero |
| `R9AP1R1-P293` | Qualification facade call event exists |
| `R9AP1R1-P294` | Resample broker execute event exists |
| `R9AP1R1-P295` | Pipeline final publication event exists |
| `R9AP1R1-P296` | Preview public entry event exists |
| `R9AP1R1-P297` | Export public entry event exists |
| `R9AP1R1-P298` | Event lineage forms one continuous public path |
| `R9AP1R1-P299` | No-direct-driver receipt is replayed from runtime evidence |
| `R9AP1R1-P300` | No-direct-driver violation count is zero |

### ARTIFACT_MANIFEST_AND_RUN_BINDING

| Gate | Requirement |
|---|---|
| `R9AP1R1-P301` | Sidecar snapshot artifact exists |
| `R9AP1R1-P302` | Build Lock replay artifact exists |
| `R9AP1R1-P303` | Package closure manifest artifact exists |
| `R9AP1R1-P304` | Closure binding artifact exists |
| `R9AP1R1-P305` | Boot permit artifact exists |
| `R9AP1R1-P306` | Normal runtime boot artifact exists |
| `R9AP1R1-P307` | Runtime composition artifact exists |
| `R9AP1R1-P308` | Qualification session artifact exists |
| `R9AP1R1-P309` | Fixture publication artifact exists |
| `R9AP1R1-P310` | Preview public-entry artifact exists |
| `R9AP1R1-P311` | Export public-entry artifact exists |
| `R9AP1R1-P312` | Evidence save artifact exists |
| `R9AP1R1-P313` | Shared tuple artifact exists |
| `R9AP1R1-P314` | No-direct-driver artifact exists |
| `R9AP1R1-P315` | Every artifact run ID matches |
| `R9AP1R1-P316` | Every artifact package closure digest matches |
| `R9AP1R1-P317` | Every artifact sidecar SHA matches |
| `R9AP1R1-P318` | Every artifact permit digest matches |
| `R9AP1R1-P319` | Artifact digest chain is continuous |
| `R9AP1R1-P320` | Artifact manifest self-hash verifies |

### CLEANUP_AND_ZERO_LEAK

| Gate | Requirement |
|---|---|
| `R9AP1R1-P321` | Qualification fixture surface pin count returns to zero |
| `R9AP1R1-P322` | Preview scheduler pending count returns to zero |
| `R9AP1R1-P323` | Export operation grant count returns to zero |
| `R9AP1R1-P324` | Host save session count returns to zero |
| `R9AP1R1-P325` | Host save temporary file count returns to zero |
| `R9AP1R1-P326` | Encoder worker pending job count returns to zero |
| `R9AP1R1-P327` | Resample broker pending request count returns to zero |
| `R9AP1R1-P328` | Qualification operation grant count returns to zero |
| `R9AP1R1-P329` | Qualification challenge count returns to zero |
| `R9AP1R1-P330` | Qualification service active request count returns to zero |
| `R9AP1R1-P331` | Run artifact publisher closes exactly once |
| `R9AP1R1-P332` | Run lock releases exactly once |
| `R9AP1R1-P333` | Qualification window closes after finalization |
| `R9AP1R1-P334` | Runtime services dispose in reverse order |
| `R9AP1R1-P335` | No user document handle remains open |
| `R9AP1R1-P336` | No package file handle remains writable |
| `R9AP1R1-P337` | No sidecar file mutation is observed |
| `R9AP1R1-P338` | No package mutation is observed |
| `R9AP1R1-P339` | Production Pointer remains unchanged |
| `R9AP1R1-P340` | Local Activation Pointer remains unchanged |

### FINAL_PACKAGED_SEAL

| Gate | Requirement |
|---|---|
| `R9AP1R1-P341` | All external sidecar gates pass |
| `R9AP1R1-P342` | All Build Lock replay gates pass |
| `R9AP1R1-P343` | All closure binding gates pass |
| `R9AP1R1-P344` | All qualification window gates pass |
| `R9AP1R1-P345` | All normal runtime composition gates pass |
| `R9AP1R1-P346` | All qualification session gates pass |
| `R9AP1R1-P347` | All fixture publication gates pass |
| `R9AP1R1-P348` | All Preview public-entry gates pass |
| `R9AP1R1-P349` | All Export public-entry gates pass |
| `R9AP1R1-P350` | All evidence save gates pass |
| `R9AP1R1-P351` | All shared final-surface tuple gates pass |
| `R9AP1R1-P352` | All no-direct-driver gates pass |
| `R9AP1R1-P353` | All artifact lineage gates pass |
| `R9AP1R1-P354` | All cleanup gates pass |
| `R9AP1R1-P355` | Packaged final receipt counts are exact |
| `R9AP1R1-P356` | Packaged final receipt pending count is zero |
| `R9AP1R1-P357` | Packaged final receipt fail count is zero |
| `R9AP1R1-P358` | Packaged final receipt self-hash verifies |
| `R9AP1R1-P359` | Packaged final historical pass carry-forward is zero |
| `R9AP1R1-P360` | Final state awaits R9A-P1-R2 device-loss wiring |

# 20. Source 목표 상태

```text
RESAMPLE_RUNTIME_R9A_P1_R1_EXTERNAL_BUILD_ADMISSION_AND_NORMAL_PRODUCT_ENTRY_SOURCE_SEALED_AWAITING_BUILD_LOCK_R2_WIN32_AND_PACKAGED_QUALIFICATION

360 SOURCE PASS
360 PACKAGED PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

externalSidecarEmitted             = false
buildLockR2FinalAdmitted           = false
packagedClosureBound               = false
normalRuntimeCompositionExecuted   = false
previewPublicEntryExecuted         = false
exportPublicEntryExecuted          = false
directKernelDriverInvocationCount  = 0
historicalPassCarryForward         = 0
productionPointerMutated           = false
localActivationPointerMutated      = false
```

# 21. Final Packaged 목표 상태

```text
RESAMPLE_RUNTIME_R9A_P1_R1_NORMAL_RUNTIME_COMPOSITION_PRODUCT_ENTRY_PACKAGED_VALIDATED_AWAITING_R9A_P1_R2_DEVICE_LOSS

360 SOURCE PASS
360 PACKAGED PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

externalBuildAdmissionSidecarVerified = true
buildLockChildChainReplayed            = true
packagedClosureBound                   = true
normalRuntimeCompositionExecuted       = true
qualificationSessionScoped             = true
canonicalFixturePublished              = true
previewPublicEntryExecuted             = true
exportPublicEntryExecuted              = true
evidenceSaveSinkCommitted              = true
sharedFinalSurfaceTupleVerified         = true
directKernelDriverInvocationCount      = 0
legacyFinalSurfaceBridgeInvocationCount = 0
historicalPassCarryForward              = 0
productionPointerMutated                = false
localActivationPointerMutated           = false
```

# 22. 완료 조건

- Build Lock R2 external sidecar가 package bytes를 변경하지 않고 생성된다.
- Packaged main process가 sidecar full child chain과 current package closure를 재검증한다.
- Qualification window가 normal renderer entry와 normal module composition을 사용한다.
- Qualification session은 installed·fleet·distribution PASS를 주장하지 않는다.
- Synthetic fixture가 canonical broker·Surface Registry·Pipeline을 통과한다.
- Preview가 `DadumPreviewPresenter.requestPresent()`로 실행된다.
- Export가 `DadumRuntimeExport.exportFinal()`로 실행된다.
- Export bytes가 evidence-only save sink에 atomic 저장된다.
- Preview와 Export가 같은 final-surface tuple을 소비한다.
- Qualification runner의 direct private kernel driver invocation count가 0이다.
- Package·sidecar·포인터 mutation count가 0이다.

# 23. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2

Recovery-Aware Runtime Holder /
Lease Reacquisition /
Pipeline Rebuild /
Pending Preview·Export Loss Injection /
Three-Cycle Device Epoch Replay Seal
```

P1-R1이 정상 제품 진입 경로를 닫은 뒤에만 P1-R2가 그 동일 composition에 device loss를 주입한다. direct driver 우회 경로에 device loss를 붙여서는 후속 증거가 제품 authority를 대표하지 못한다.

