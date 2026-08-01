# TDT-RESAMPLE-RUNTIME-01-R8A

## Active-Required JavaScript Parse Closure / Canonical Resample Executor Registration / Actual Kernel Identity Propagation / Repeated Device-Loss Re-Registration / Zero Silent Export Fallback Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R8A`
- **Logical correction parent:** `TDT-RESAMPLE-RUNTIME-01-R8`
- **Repository application parent:** `TDT-RESAMPLE-RUNTIME-01-R13`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R13_COHORT_ROLLOUT_PRIVACY_SOURCE_BAKED_AWAITING_FLEET.zip`
- **Parent repository bundle SHA-256:** `5d6d474f073357281199c739bbd6ea03ca97b55f426fae208bf043d5bff9b855`
- **Parent repository source state:** `RESAMPLE_RUNTIME_R13_COHORT_ROLLOUT_HARNESS_SOURCE_BAKED_AWAITING_QUALIFIED_MULTI_INSTALLATION_FLEET`
- **Target source state:** `RESAMPLE_RUNTIME_R8A_ACTIVE_RUNTIME_TRUTH_CLOSURE_SEALED_AWAITING_R9A_PHYSICAL_GPU`
- **Downstream lineage state:** `R9_TO_R13_SOURCE_RECEIPTS_SUPERSEDED_BY_R8A_REBASE_REQUIRED`
- **Physical GPU state:** `DEFERRED_TO_TDT_RESAMPLE_RUNTIME_01_R9A`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Local Activation Pointer mutation:** forbidden
- **Canonical lowpass kernel identity:** `tdt.ewa.ellipse.phase-correct-parametric-r6.v1`
- **Canonical lowpass ABI:** `tdt.delta-k-ewa.params.v4`
- **Canonical stage planner:** `tdt.ewa.multistage.planner.v3`
- **R8A parser authority:** `tdt.active-runtime.javascript-parse-closure.r8a.v1`
- **R8A executor authority:** `tdt.resample.canonical-executor-registration.r8a.v1`
- **R8A identity authority:** `tdt.resample.actual-kernel-identity-propagation.r8a.v1`
- **R8A recovery authority:** `tdt.resample.repeated-device-loss-registration.r8a.v1`
- **R8A export outcome authority:** `tdt.export.zero-silent-fallback.r8a.v1`
- **Runtime CPU resample fallback:** forbidden
- **Silent WGPU-only return:** forbidden
- **Unknown-format to PNG coercion:** forbidden
- **Caller-authored canonical kernel identity:** forbidden
- **Active-required unparsed JavaScript:** forbidden
- **Downstream source receipt silent preservation after active-code mutation:** forbidden

---

# 0. Executive Contract

R8A is a corrective runtime-truth patch. It shall repair six confirmed gaps in the latest R13 repository without changing the R8 mathematical filter identity.

The confirmed parent defects are:

1. `app/legacy-runtime/encoders/webp_api_forced.js` is admitted as an active required runtime asset but contains ESM imports and a top-level `return`, so the module cannot be parsed under the repository's `type: module` semantics.
2. `app/legacy-runtime/js/export/wgpu_export_install.js` declares `__dkMapUIExportFormatToWGPU` twice in one module scope, so the module cannot be parsed.
3. `ResampleWorkerBrokerService` exposes `registerExecutor`, but no product bootstrap registers the canonical R8 executor. Scaled canonical requests can therefore fail with `E_RESAMPLE_WORKER_EXECUTOR_MISSING`.
4. `resample_compatibility_r1d.mjs` writes `executedKernelId: 'tdt-ewa-aniso-r1c-v3'` instead of propagating the kernel identity actually present in the R8 lowpass receipt.
5. `export_wgsl_downscale.js` registers one recovery participant whose closure captures the first state. After the first device loss, a later rebuilt state can remain outside the registered invalidation closure.
6. `dk_autowire.js` catches WGPU module-load, surface, and export failures and returns silently when `__DK_EXPORT_WGPU_ONLY` is true. A user-visible export request can therefore terminate without a file, structured error, or failure receipt.

R8A shall close these defects with five authorities:

```text
active-required parse authority
    every admitted JavaScript asset has an explicit script semantic and passes the matching parser

canonical executor authority
    the runtime broker receives exactly one R8 executor from the service container lifecycle

actual identity authority
    compatibility and broker receipts derive kernel, planner, ABI, and manifest identities from executed lowpass evidence

recovery registration authority
    every live export state is invalidated across repeated device-loss epochs

export outcome authority
    every export request ends in explicit success, explicit authorized fallback, cancellation, or structured failure
```

R8A shall not change the R4 continuous lattice, R5 axial tensor interpolation, R6 kernel equation, R8 support envelope, alpha semantics, border semantics, or DC conservation rules. It changes runtime admission and receipt truth around those authorities.

Because R8A changes active runtime files logically owned by R8 while applying to the latest R13 tree, all previously baked R9 through R13 source receipts shall be marked superseded. They may remain as historical evidence, but they shall not be accepted as current promotion evidence until replayed on the R8A tree.

---

# 1. Parent Evidence and Confirmed Source Facts

## 1.1 Parent bundle

```text
61_TDT_RESAMPLE_RUNTIME_01_R13_COHORT_ROLLOUT_PRIVACY_SOURCE_BAKED_AWAITING_FLEET.zip
SHA-256 5d6d474f073357281199c739bbd6ea03ca97b55f426fae208bf043d5bff9b855
```

## 1.2 Confirmed parent file digests

| File | Parent SHA-256 |
|---|---|
| `app/legacy-runtime/encoders/webp_api_forced.js` | `f48a6ad46bbb4900bebe1bcf10f0dbdaf14c5d3e3bac95298267b55a53e57660` |
| `app/legacy-runtime/js/export/wgpu_export_install.js` | `c961154b3f3e36f74dd0aa727d7f4135d7ef7e1e4bb5b87ae1fcc3f480d9fcca` |
| `app/legacy-runtime/js/passes/dk_autowire.js` | `82ff290f4807d322daca958228572d74f25d684ea72614d74c9725309da3dc1f` |
| `app/src/runtime/resample/resample-worker-broker-service.ts` | `6ee1dce0cf72d286bdef68253418b8588c06242269af9bb438b9a40429c9319c` |
| `app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs` | `fbce21acff91dde9a6c065978b3c1f19a4a3fd573c77a24cf4a53fac73f07635` |
| `app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js` | `54449264f4fd381b7c318fb7180da84e3216b914a9a175f8609bc5ca3f7b063e` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r8.mjs` | `9d492931ac6849b9d2e3d2fe7d1f14475589cd8da705b02c9c79134e06c0cb7d` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v4.mjs` | `e8880cc46d2eec796e360c44f326e87692db9b25c23d788c6dff30c0e357fcf6` |


## 1.3 Confirmed parser failures

The parent package declares `"type": "module"`.

`app/legacy-runtime/encoders/webp_api_forced.js` contains:

```js
import { encodeRGBAtoWebP } from './webp_api.js';

if (!canvas) {
  console.error('[ΔK] No canvas found for export');
  return;
}
```

A top-level return is invalid in an ESM module.

`app/legacy-runtime/js/export/wgpu_export_install.js` contains two module-scope declarations of:

```js
function __dkMapUIExportFormatToWGPU(fmtRaw) { ... }
```

The duplicate lexical declaration is invalid in an ESM module.

## 1.4 Confirmed Active Graph semantic mismatch

The parent Active Graph node manifest classifies both files as `classic-script` even though they are reached through dynamic import and contain ESM syntax.

```text
app/legacy-runtime/encoders/webp_api_forced.js
    status = ACTIVE_REQUIRED
    kind   = classic-script
    owner  = dadum.legacy.index-inline-01.mjs

app/legacy-runtime/js/export/wgpu_export_install.js
    status = ACTIVE_REQUIRED
    kind   = classic-script
    owner  = dadum.legacy.js-passes-dk_autowire.js
```

R8A shall derive script semantics from the admitted loading edge and syntax contract, not from `.js` extension alone.

## 1.5 Confirmed broker gap

`ResampleWorkerBrokerService` exposes a single-writer `registerExecutor()` API and rejects scaled canonical work when no executor exists. Product source search shows the registration API definition, but no admitted bootstrap registration call.

## 1.6 Confirmed identity gap

The canonical adaptive compatibility object currently contains:

```js
executedKernelId: 'tdt-ewa-aniso-r1c-v3'
```

The actual R8 execution receipt carries the R6 mathematical kernel identity and its contract digest. R8A shall propagate those executed identities rather than a compatibility-era label.

## 1.7 Confirmed repeated-loss gap

The parent Export facade stores module-global `statePromise` and `recoveryUnregister`, but the recovery closure captures the state created during first registration. The closure is not rebound when a new state is lazily created after invalidation.

## 1.8 Confirmed silent export gap

The parent autowire route contains three WGPU-only branches that return without a structured failure:

```text
missing afterFinalColorWGPU
module import or direct export exception
successful direct export with no explicit outcome receipt
```

R8A shall make terminal outcome explicit.

---

# 2. Scope

R8A includes:

- Active Graph JavaScript semantic correction;
- parser closure for every `ACTIVE_REQUIRED` JavaScript and MJS asset;
- explicit ESM WebP adapter surface;
- removal or quarantine of top-level export side effects;
- WGPU export module deduplication;
- canonical format-policy SSOT;
- canonical R8 executor adapter implementation;
- service-container registration and disposal;
- broker canonical result identity validation;
- actual kernel, contract, ABI, planner, manifest, and lowpass receipt propagation;
- repeated device-loss state invalidation and lazy rebuild;
- bridge replacement and unregister behavior;
- explicit export outcome receipt;
- WGPU-only fail-closed behavior;
- explicit non-WGPU fallback policy;
- downstream R9-R13 receipt invalidation and replay requirement;
- source negative controls and physical revalidation handoff.

---

# 3. Non-Goals

R8A does not:

- change the EWA kernel equation;
- change R8 support or conservation math;
- add JPEG to the WGPU encoder path;
- convert unsupported formats to PNG silently;
- claim physical GPU parity;
- execute R9 timestamp or residency tests;
- move the Production Pointer;
- move the local activation pointer;
- complete R10 release, R11 installation, R12 update, or R13 fleet gates;
- preserve downstream PASS receipts as current after active-code mutation;
- authorize CPU, Canvas, WebGL, or legacy resampling fallback under WGPU-only mode.

---

# 4. Authority and State Ownership

## 4.1 Active Graph Authority

The Active Graph owns whether an asset is required and how it is loaded. R8A adds explicit JavaScript semantics:

```ts
type JavaScriptSemantic =
  | 'esm-module'
  | 'classic-script'
  | 'module-worker'
  | 'classic-worker';
```

The loading edge is authoritative:

```text
static import / dynamic import / type=module
    → esm-module

new Worker(url, {{ type: 'module' }})
    → module-worker

classic <script> without type=module
    → classic-script

new Worker(url) without module type
    → classic-worker
```

Extension-only inference is forbidden.

## 4.2 Canonical Resample Executor Authority

The runtime service container owns executor registration. The legacy module may execute the R8 lowpass but shall not install arbitrary global executors by side effect.

The executor registration owner shall be a dedicated runtime service or bootstrap module with one lifecycle:

```text
runtime initialize
→ resolve GPU service and broker
→ create R8 executor adapter
→ register exactly once
→ serve requests
→ device-loss invalidate internal state
→ runtime dispose unregister
```

## 4.3 Actual Identity Authority

The executed lowpass receipt is the SSOT for:

```text
kernelId
kernelContractId
kernelContractDigest
parameterAbiId
plannerId
planDigest
generatedManifestId
generatedManifestDigest
shaderDigest
```

No compatibility adapter or caller may replace these values with a remembered label.

## 4.4 Recovery Authority

The GPU Authority bridge owns device epoch changes. The Export facade owns its current state reference and shall register a participant that invalidates the current state, not a captured historical state.

## 4.5 Export Outcome Authority

Every requested Export shall return or throw one terminal outcome:

```ts
type ExportTerminalOutcome =
  | {{ status: 'SUCCESS'; receipt: ExportSuccessReceipt }}
  | {{ status: 'FALLBACK_AUTHORIZED'; receipt: ExportFallbackReceipt }}
  | {{ status: 'CANCELLED'; receipt: ExportCancellationReceipt }}
  | never; // structured error is thrown
```

A bare `return` from a failure branch is forbidden.

---

# 5. Active-Required JavaScript Parse Closure

## 5.1 Parser inventory

R8A shall generate a canonical parser inventory from the Active Graph node manifest. Each record includes:

```ts
interface ActiveJavaScriptParseRecord {
  schemaVersion: 1;
  nodeId: string;
  status: 'ACTIVE_REQUIRED' | 'ACTIVE_OPTIONAL';
  sourceRelative: string;
  sourceSha256: string;
  ownerRootId: string | null;
  semantic: JavaScriptSemantic;
  loadingEdge: string;
  parserId: string;
  parseStatus: 'PASS' | 'FAIL';
  diagnosticCode: string | null;
  diagnosticLocation: {{ line: number; column: number }} | null;
}
```

All `ACTIVE_REQUIRED` records shall pass. Optional assets may not hide a required import chain failure.

## 5.2 ESM parser

ESM assets shall be parsed under repository module semantics. Required checks include:

- syntax parse;
- duplicate lexical declaration rejection;
- top-level return rejection;
- unresolved static import path rejection;
- dynamic import literal target admission;
- import target semantic consistency;
- no CommonJS `require` assumption unless explicitly bridged;
- no browser execution during parse-only gate.

## 5.3 Classic parser

Classic scripts shall be parsed as scripts rather than modules. They may not contain static `import` or `export`. If a classic script dynamically imports an ESM module, the target remains ESM and shall be separately parsed.

## 5.4 Worker parser

Worker assets shall be parsed under their declared worker type. A module worker may import ESM. A classic worker shall not be silently promoted to module semantics by the gate.

## 5.5 Dynamic import edge closure

The parser gate shall inspect admitted literal dynamic imports. The following parent edges are mandatory:

```text
dk_autowire.js
→ ../export/wgpu_export_install.js

webp_shim.js
→ ./encoders/webp_api_forced.js

tile_encoder_worker_qaware_plus.js
→ configured WebP module path
```

The target shall be parseable and expose the expected API.

## 5.6 Parse report

The report shall include totals by semantic and status. A summary that only counts file hashes is insufficient.

---

# 6. Canonical WebP Adapter Repair

## 6.1 Module role

`app/legacy-runtime/encoders/webp_api_forced.js` shall become a side-effect-free ESM adapter. It shall not query the DOM, capture a canvas, choose a format, save a file, or auto-run an async IIFE at import time.

Its canonical exports shall include:

```ts
ensureWebPReady
encodeRGBAtoWebP
encodeRGBAtoWebPLossless
encodeLosslessRGBA
WebP
```

Aliases shall delegate to one encoder implementation and preserve exact byte-return semantics.

## 6.2 Required compatibility surfaces

The repaired adapter shall satisfy both current callers:

```text
webp_shim.js
    ensureWebPReady or encodeLosslessRGBA

tile_encoder_worker_qaware_plus.js
    WebP.encodeRGBAtoWebPLossless
```

A default export may be retained only if it exposes the same canonical API and contains no execution side effect.

## 6.3 Explicit forced export action

If the old one-shot canvas export behavior remains needed, it shall move to a separately named explicit function such as:

```ts
export async function exportCurrentCanvasExplicit(request): Promise<ExportTerminalOutcome>
```

It shall not run on import.

## 6.4 No hidden format fallback

The WebP adapter shall not contain JXL or PNG fallback behavior. Format routing belongs to the Export router.

---

# 7. WGPU Export Module Parse and Policy Closure

## 7.1 Single format mapper

`wgpu_export_install.js` shall contain exactly one canonical UI-to-runtime format mapper.

```ts
type WgpuExportFormat = 'png' | 'webp' | 'jxl';
```

JPEG and unknown values shall produce structured unsupported-format errors. They shall not be mapped to PNG.

## 7.2 UI behavior

The UI may disable unsupported options. UI correction shall not alter a user's requested format without explicit visible state and receipt.

## 7.3 Installer idempotence

`installWGPUExportHook()` shall be idempotent and shall expose one immutable authority marker. Reinstallation with a different implementation shall fail with collision.

## 7.4 Import smoke

The repaired module shall pass:

- parser gate;
- browser-like import smoke with controlled `window` and `document` stubs;
- hook installation smoke;
- supported format dispatch smoke;
- unsupported format negative control.

---

# 8. Zero Silent Export Fallback

## 8.1 Explicit fallback policy

```ts
type ExportFallbackPolicy =
  | 'forbid'
  | 'legacy-explicit';
```

Default under `__DK_EXPORT_BACKEND === 'wgpu'` is `forbid`.

`__DK_EXPORT_WGPU_ONLY === true` implies `forbid` and cannot be weakened by another global.

## 8.2 WGPU-only failure rules

The following shall throw stable errors and emit failure receipts:

```text
WGPU prepass unavailable
canonical output surface missing
WGPU export module parse or import failure
unsupported requested format
encoder unavailable
terminal save failure
zero-byte output
missing success receipt
```

Required codes include:

```text
E_R8A_WGPU_PREPASS_FAILED
E_R8A_WGPU_EXPORT_SURFACE_MISSING
E_R8A_WGPU_EXPORT_MODULE_LOAD_FAILED
E_R8A_WGPU_EXPORT_FORMAT_UNSUPPORTED
E_R8A_WGPU_EXPORT_FAILED
E_R8A_WGPU_EXPORT_ZERO_OUTPUT
E_R8A_WGPU_EXPORT_RECEIPT_MISSING
E_R8A_WGPU_EXPORT_SAVE_FAILED
```

## 8.3 Explicit legacy fallback

Legacy fallback is allowed only when all are true:

```text
policy = legacy-explicit
WGPU-only = false
reason is allowlisted
fallback target is named
user-visible state reports fallback
fallback receipt is emitted
legacy exporter returns success evidence
```

The fallback receipt shall contain the WGPU failure code and shall not claim canonical EWA publication.

## 8.4 Success receipt

A success receipt includes:

```ts
interface ExportSuccessReceipt {
  schemaVersion: 1;
  receiptKind: 'tdt.export.success.r8a';
  requestId: string;
  backend: 'wgpu';
  format: WgpuExportFormat;
  byteLength: number;
  saved: true;
  sourceSurfaceId: string;
  lowpassReceiptDigest: string;
  kernelId: string;
  kernelContractId: string;
  parameterAbiId: string;
  plannerId: string;
  outputDigest: string;
}
```

Console output is not a receipt.

## 8.5 Autowire wrapper terminal behavior

The wrapper shall never convert an exception into a bare return. It shall either return a success/fallback outcome or throw a stable error to the original caller.

---

# 9. Canonical Resample Executor Registration

## 9.1 Dedicated adapter

R8A shall add a dedicated adapter that converts `ResampleCompatibilityRequest` into the actual R8 execution call.

The adapter shall:

- resolve the active GPU device from `GpuService`;
- bind runtime and device epochs;
- reject stale requests;
- honor `AbortSignal` before every material stage;
- normalize R8 policy and alpha semantics;
- execute the canonical lowpass path;
- return a canonical surface result;
- attach the full actual receipt chain;
- avoid CPU-scaled byte output.

## 9.2 Registration lifecycle

Registration shall occur after both broker and GPU services are initialized.

```text
initialize
→ create stable executor function
→ broker.registerExecutor(executor)
→ retain unregister function
→ device loss invalidates executor-owned pipelines, not registration authority
→ dispose unregisters exactly once
```

## 9.3 Single writer

A second different executor registration shall fail with `E_RUNTIME_SERVICE_COLLISION`. Re-registering the same executor identity after a deliberate lifecycle rebuild shall require the prior unregister receipt.

## 9.4 Request admission

Canonical scaling requests require:

```text
outputMode = canonical surface
source dimensions > 0
target dimensions > 0
runtime epoch exact
request ID unique
explicit source alpha semantic
explicit source transfer semantic
```

Compatibility bytes remain admitted only for exact-size passthrough and shall never claim canonical anisotropy.

## 9.5 Result validation

The broker shall verify that canonical results contain:

```text
surfaceId
resampleReceiptId
resampleReceiptDigest
allowFinalPublication = true
canonicalAnisotropicClaim = true
actual identity bundle
```

The broker shall recompute the digest of the attached receipt rather than trusting a caller-provided digest string.

---

# 10. Actual Kernel Identity Propagation

## 10.1 Identity source

The compatibility adapter shall derive identities from the executed receipt in this order:

```text
final lowpass receipt
→ stage planner receipt
→ EWA execution receipt
```

No fallback string is allowed for canonical results.

## 10.2 Required propagated fields

```ts
interface ActualResampleIdentity {
  kernelId: string;
  kernelContractId: string;
  kernelContractDigest: string;
  parameterAbiId: string;
  plannerId: string;
  planDigest: string;
  generatedManifestId: string;
  generatedManifestDigest: string;
  shaderDigestSet: readonly string[];
}
```

## 10.3 Compatibility object repair

The hard-coded value:

```text
tdt-ewa-aniso-r1c-v3
```

shall not be emitted as `executedKernelId` for an R8 canonical result. If retained, it may appear only as a historical compatibility adapter version in a separately named field.

## 10.4 Cross-layer identity equality

The following shall be equal:

```text
R8 lowpass receipt kernelId
compatibility result executedKernelId
broker result actualIdentity.kernelId
Export success receipt kernelId
R9A physical test expected kernelId
```

Mismatch fails closed.

---

# 11. Repeated Device-Loss Re-Registration

## 11.1 Facade-owned current state

The Export facade shall hold one mutable authority record:

```ts
interface ExportGpuAuthorityState {
  bridgeIdentity: string;
  currentState: ExportPipelineState | null;
  participantUnregister: (() => void) | null;
  recoveryGeneration: number;
  stateGeneration: number;
}
```

The recovery participant shall dereference `currentState` at invalidation time. It shall not close over the first state object.

## 11.2 Rebuild behavior

On device loss:

```text
invalidate current state
→ dispose tensor and EWA pipelines exactly once
→ release lease exactly once
→ clear current state promise
→ increment recovery generation
→ reject pending job
→ next request acquires fresh lease
→ rebuild pipelines for new device epoch
```

## 11.3 Bridge replacement

If the GPU Authority bridge identity changes, R8A shall unregister from the old bridge before registering with the new bridge. One module shall not remain registered in two bridges.

## 11.4 Repeated-loss fixture

Source self-test shall execute at least three loss cycles:

```text
epoch 1 execute
→ loss 1
→ epoch 2 execute
→ loss 2
→ epoch 3 execute
→ loss 3
→ epoch 4 execute
```

For each cycle:

- the prior lease is released once;
- prior pipelines are disposed once;
- stale state cannot dispatch;
- a fresh lease is acquired;
- participant count remains one;
- output receipt carries the new device epoch.

## 11.5 Broker executor across loss

The canonical executor registration authority may remain installed across device loss, but its device-bound cache shall be invalidated. It shall resolve the current GPU service device for the next request and reject stale in-flight completion.

---

# 12. Downstream Lineage Rebase

## 12.1 Why invalidation is mandatory

R8A modifies active code that R9 through R13 source receipts treated as parent evidence. Their historical receipts remain useful audit records but are no longer current evidence for the patched tree.

## 12.2 Invalidation receipt

R8A shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R8A_DOWNSTREAM_INVALIDATION_RECEIPT.json
```

with:

```ts
interface DownstreamInvalidationReceipt {
  schemaVersion: 1;
  receiptKind: 'tdt.resample.downstream-invalidation.r8a';
  parentBundleSha256: string;
  changedAuthorityIds: readonly string[];
  supersededPatches: readonly ['R9','R10','R11','R12','R13'];
  historicalReceiptDigests: readonly string[];
  reasonCode: 'ACTIVE_RUNTIME_CODE_CHANGED';
  productionPointerMutated: false;
}
```

## 12.3 Replay order

Current evidence shall be rebuilt in order:

```text
R8A source seal
→ R9A physical GPU
→ R10 release replay
→ R11 installed attestation replay
→ R12 update replay
→ R13 fleet replay
```

No later receipt may be replayed over an unsealed predecessor.

---

# 13. Runtime Telemetry and Receipts

R8A shall expose monotonic counters:

```text
activeRequiredParsePassCount
activeRequiredParseFailCount
canonicalExecutorRegistrationCount
canonicalExecutorCollisionCount
canonicalExecutorRequestCount
actualIdentityPropagationCount
identityMismatchCount
recoveryInvalidationCount
recoveryRebuildCount
staleEpochRejectionCount
wgpuExportSuccessCount
wgpuExportFailureCount
explicitFallbackCount
silentFallbackCount
```

`silentFallbackCount` shall remain exactly zero.

The R8A final source receipt shall include parser inventory digest, executor registration receipt digest, identity parity report digest, repeated-loss report digest, export outcome negative-control digest, and downstream invalidation receipt digest.

---

# 14. Required Negative Controls

R8A shall prove detection of at least the following:

1. top-level return in ESM;
2. duplicate function declaration in ESM;
3. ESM asset classified as classic script;
4. classic script containing static import;
5. missing dynamic import target;
6. WebP adapter missing `encodeRGBAtoWebPLossless`;
7. WebP adapter import side effect touches DOM;
8. WGPU module import failure under WGPU-only;
9. missing WGPU output surface;
10. unsupported JPEG request;
11. unknown format request;
12. zero-byte encoder result;
13. save failure;
14. missing export success receipt;
15. unauthorized legacy fallback;
16. fallback receipt claiming canonical publication;
17. missing canonical executor registration;
18. second different executor registration;
19. stale runtime epoch request;
20. duplicate request ID;
21. caller-forged kernel identity;
22. receipt digest mismatch;
23. ABI identity mismatch;
24. planner identity mismatch;
25. first device-loss stale state reuse;
26. second device-loss stale state reuse;
27. duplicate recovery participant;
28. old bridge participant leak;
29. stale completion after loss;
30. downstream receipt accepted without R8A replay.

---

# 15. Source and Physical State Boundary

Source gates may prove parsing, registration topology, deterministic identity propagation, synthetic repeated-loss recovery, and zero-silent-fallback behavior.

Source gates may not claim:

- physical WGSL execution;
- actual browser module loading in packaged Electron;
- actual D3D12 repeated device loss;
- real export file creation;
- physical R9 parity;
- installed or fleet readiness.

These remain deferred to R9A and downstream replay.

---

# 16. Deliverables

Required implementation deliverables:

```text
app/runtime or app/src runtime canonical executor adapter
Active Graph JavaScript semantic classifier
Active Required parser gate
repaired WebP adapter
repaired WGPU export module
repaired autowire outcome handling
repaired compatibility identity propagation
repaired repeated-loss Export facade
R8A source fixtures
R8A negative controls
R8A source gate
R8A final source receipt
downstream invalidation receipt
changed-file manifest
unified diff
```

---

# 17. Gate Matrix

The canonical gate count is:

```text
SOURCE_MANDATORY       253
PHYSICAL_REVALIDATION    8
TOTAL                  261
```

Source completion requires all 253 source gates PASS and all eight physical gates DEFERRED with explicit R9A ownership. A physical PASS claim from source evidence is a failure.


## 17.1 Parent and Lineage Authority

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S001` | Parent bundle digest exact | `PASS` |
| `R8A-S002` | Logical R8 correction parent declared | `PASS` |
| `R8A-S003` | Repository R13 application parent declared | `PASS` |
| `R8A-S004` | Parent active file digests exact | `PASS` |
| `R8A-S005` | Production pointer mutation forbidden | `PASS` |
| `R8A-S006` | Local activation pointer mutation forbidden | `PASS` |
| `R8A-S007` | R8 math identity frozen | `PASS` |
| `R8A-S008` | R8 support identity frozen | `PASS` |
| `R8A-S009` | R9-R13 historical receipts inventoried | `PASS` |
| `R8A-S010` | Downstream invalidation receipt schema exact | `PASS` |
| `R8A-S011` | Downstream active-code mutation reason exact | `PASS` |
| `R8A-S012` | Historical receipts retained read-only | `PASS` |
| `R8A-S013` | Historical receipts rejected as current | `PASS` |
| `R8A-S014` | Replay order R8A through R13 exact | `PASS` |
| `R8A-S015` | No downstream PASS carry-forward | `PASS` |
| `R8A-S016` | R8A final state exact | `PASS` |
| `R8A-S017` | R9A next authority exact | `PASS` |
| `R8A-S018` | Parent regression entrypoint present | `PASS` |

## 17.2 Active Graph JavaScript Semantic Closure

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S019` | Active Graph node manifest loaded | `PASS` |
| `R8A-S020` | All ACTIVE_REQUIRED JS inventoried | `PASS` |
| `R8A-S021` | All ACTIVE_REQUIRED MJS inventoried | `PASS` |
| `R8A-S022` | Loading edge recorded per asset | `PASS` |
| `R8A-S023` | Static import classifies ESM | `PASS` |
| `R8A-S024` | Dynamic import classifies ESM | `PASS` |
| `R8A-S025` | Module script classifies ESM | `PASS` |
| `R8A-S026` | Classic script classifies classic | `PASS` |
| `R8A-S027` | Module worker classifies module worker | `PASS` |
| `R8A-S028` | Classic worker classifies classic worker | `PASS` |
| `R8A-S029` | Extension-only inference forbidden | `PASS` |
| `R8A-S030` | WebP adapter classified ESM | `PASS` |
| `R8A-S031` | WGPU export installer classified ESM | `PASS` |
| `R8A-S032` | Parser ID recorded | `PASS` |
| `R8A-S033` | Source digest recorded | `PASS` |
| `R8A-S034` | Owner root recorded | `PASS` |
| `R8A-S035` | ESM parse pass required | `PASS` |
| `R8A-S036` | Classic parse pass required | `PASS` |
| `R8A-S037` | Module worker parse pass required | `PASS` |
| `R8A-S038` | Classic worker parse pass required | `PASS` |
| `R8A-S039` | Top-level return negative control | `PASS` |
| `R8A-S040` | Duplicate declaration negative control | `PASS` |
| `R8A-S041` | Static import in classic negative control | `PASS` |
| `R8A-S042` | Unresolved static import negative control | `PASS` |
| `R8A-S043` | Missing dynamic import target negative control | `PASS` |
| `R8A-S044` | Dynamic target semantic mismatch negative control | `PASS` |
| `R8A-S045` | Parser diagnostic code stable | `PASS` |
| `R8A-S046` | Parser diagnostic location recorded | `PASS` |
| `R8A-S047` | Required parse failure blocks build | `PASS` |
| `R8A-S048` | Optional asset cannot mask required failure | `PASS` |
| `R8A-S049` | Parse report self-hash | `PASS` |
| `R8A-S050` | Parse inventory deterministic | `PASS` |
| `R8A-S051` | Parse inventory path order canonical | `PASS` |
| `R8A-S052` | Symlink target excluded | `PASS` |
| `R8A-S053` | Path traversal excluded | `PASS` |
| `R8A-S054` | Generated admission manifest refreshed | `PASS` |
| `R8A-S055` | Generated active graph refreshed | `PASS` |
| `R8A-S056` | Runtime asset manifest refreshed | `PASS` |
| `R8A-S057` | Parser gate in verify renderer chain | `PASS` |
| `R8A-S058` | Parser gate in build emit chain | `PASS` |
| `R8A-S059` | Parser report receipt emitted | `PASS` |
| `R8A-S060` | Zero unparsed ACTIVE_REQUIRED assets | `PASS` |

## 17.3 Canonical WebP Adapter Closure

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S061` | WebP adapter has no top-level return | `PASS` |
| `R8A-S062` | WebP adapter has no import-time DOM query | `PASS` |
| `R8A-S063` | WebP adapter has no import-time canvas readback | `PASS` |
| `R8A-S064` | WebP adapter has no import-time file save | `PASS` |
| `R8A-S065` | WebP adapter has no auto-run IIFE | `PASS` |
| `R8A-S066` | ensureWebPReady exported | `PASS` |
| `R8A-S067` | encodeRGBAtoWebP exported | `PASS` |
| `R8A-S068` | encodeRGBAtoWebPLossless exported | `PASS` |
| `R8A-S069` | encodeLosslessRGBA exported | `PASS` |
| `R8A-S070` | WebP namespace exported | `PASS` |
| `R8A-S071` | Default export API parity | `PASS` |
| `R8A-S072` | Lossless alias delegates canonical encoder | `PASS` |
| `R8A-S073` | Returned bytes are Uint8Array | `PASS` |
| `R8A-S074` | Zero-byte WebP rejected | `PASS` |
| `R8A-S075` | WebP shim import smoke | `PASS` |
| `R8A-S076` | WebP shim ensure ready smoke | `PASS` |
| `R8A-S077` | Tile worker module import smoke | `PASS` |
| `R8A-S078` | Tile worker lossless method smoke | `PASS` |
| `R8A-S079` | Worker transfer result smoke | `PASS` |
| `R8A-S080` | JXL fallback absent from adapter | `PASS` |
| `R8A-S081` | PNG fallback absent from adapter | `PASS` |
| `R8A-S082` | Unknown format router absent | `PASS` |
| `R8A-S083` | Explicit one-shot action separated | `PASS` |
| `R8A-S084` | Explicit one-shot action returns outcome | `PASS` |
| `R8A-S085` | WebP adapter API receipt emitted | `PASS` |
| `R8A-S086` | Legacy callers regression pass | `PASS` |

## 17.4 WGPU Export Module Closure

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S087` | WGPU export module parser pass | `PASS` |
| `R8A-S088` | Single format mapper declaration | `PASS` |
| `R8A-S089` | Supported PNG mapping exact | `PASS` |
| `R8A-S090` | Supported WebP mapping exact | `PASS` |
| `R8A-S091` | Supported JXL mapping exact | `PASS` |
| `R8A-S092` | JPEG unsupported error exact | `PASS` |
| `R8A-S093` | Unknown format unsupported error exact | `PASS` |
| `R8A-S094` | No implicit PNG coercion | `PASS` |
| `R8A-S095` | UI disables unsupported format | `PASS` |
| `R8A-S096` | UI internal format parity | `PASS` |
| `R8A-S097` | UI remap visible state | `PASS` |
| `R8A-S098` | Hook install idempotent | `PASS` |
| `R8A-S099` | Hook collision detected | `PASS` |
| `R8A-S100` | PNG dispatch smoke | `PASS` |
| `R8A-S101` | WebP dispatch smoke | `PASS` |
| `R8A-S102` | JXL dispatch smoke | `PASS` |
| `R8A-S103` | Missing pipeline error exact | `PASS` |
| `R8A-S104` | Missing output texture error exact | `PASS` |
| `R8A-S105` | Missing dimensions error exact | `PASS` |
| `R8A-S106` | Device acquisition error propagated | `PASS` |
| `R8A-S107` | Module browser import smoke | `PASS` |
| `R8A-S108` | No swallowed install exception | `PASS` |
| `R8A-S109` | Installer authority marker exact | `PASS` |
| `R8A-S110` | Module receipt emitted | `PASS` |

## 17.5 Zero Silent Export Fallback

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S111` | Fallback policy enum exact | `PASS` |
| `R8A-S112` | WGPU backend default forbid | `PASS` |
| `R8A-S113` | WGPU-only implies forbid | `PASS` |
| `R8A-S114` | WGPU prepass failure throws | `PASS` |
| `R8A-S115` | Missing surface throws | `PASS` |
| `R8A-S116` | Module load failure throws | `PASS` |
| `R8A-S117` | Unsupported format throws | `PASS` |
| `R8A-S118` | Encoder failure throws | `PASS` |
| `R8A-S119` | Zero output throws | `PASS` |
| `R8A-S120` | Missing receipt throws | `PASS` |
| `R8A-S121` | Save failure throws | `PASS` |
| `R8A-S122` | Cancellation explicit | `PASS` |
| `R8A-S123` | No bare return on WGPU failure | `PASS` |
| `R8A-S124` | No console-only failure | `PASS` |
| `R8A-S125` | Legacy fallback requires explicit policy | `PASS` |
| `R8A-S126` | Legacy fallback forbidden in WGPU-only | `PASS` |
| `R8A-S127` | Fallback reason allowlisted | `PASS` |
| `R8A-S128` | Fallback target named | `PASS` |
| `R8A-S129` | Fallback visible state required | `PASS` |
| `R8A-S130` | Fallback receipt required | `PASS` |
| `R8A-S131` | Fallback receipt carries WGPU failure code | `PASS` |
| `R8A-S132` | Fallback cannot claim canonical publication | `PASS` |
| `R8A-S133` | Fallback output success required | `PASS` |
| `R8A-S134` | Success outcome status exact | `PASS` |
| `R8A-S135` | Success receipt byte length positive | `PASS` |
| `R8A-S136` | Success receipt saved true | `PASS` |
| `R8A-S137` | Success receipt source surface present | `PASS` |
| `R8A-S138` | Success receipt lowpass digest present | `PASS` |
| `R8A-S139` | Success receipt actual kernel present | `PASS` |
| `R8A-S140` | Success receipt ABI present | `PASS` |
| `R8A-S141` | Success receipt planner present | `PASS` |
| `R8A-S142` | Output digest present | `PASS` |
| `R8A-S143` | Autowire returns terminal outcome | `PASS` |
| `R8A-S144` | silentFallbackCount exactly zero | `PASS` |

## 17.6 Canonical Executor Registration

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S145` | Dedicated executor adapter exists | `PASS` |
| `R8A-S146` | Executor adapter in admitted runtime graph | `PASS` |
| `R8A-S147` | Broker resolved from service container | `PASS` |
| `R8A-S148` | GPU service resolved from service container | `PASS` |
| `R8A-S149` | Registration after broker initialization | `PASS` |
| `R8A-S150` | Registration after GPU initialization | `PASS` |
| `R8A-S151` | Exactly one executor registered | `PASS` |
| `R8A-S152` | Registration receipt emitted | `PASS` |
| `R8A-S153` | Unregister function retained | `PASS` |
| `R8A-S154` | Dispose unregisters once | `PASS` |
| `R8A-S155` | Different executor collision rejected | `PASS` |
| `R8A-S156` | Same executor duplicate handled deterministically | `PASS` |
| `R8A-S157` | Canonical request output mode checked | `PASS` |
| `R8A-S158` | Source width positive | `PASS` |
| `R8A-S159` | Source height positive | `PASS` |
| `R8A-S160` | Target width positive | `PASS` |
| `R8A-S161` | Target height positive | `PASS` |
| `R8A-S162` | Runtime epoch exact | `PASS` |
| `R8A-S163` | Request ID unique | `PASS` |
| `R8A-S164` | Source alpha semantic explicit | `PASS` |
| `R8A-S165` | Source transfer semantic explicit | `PASS` |
| `R8A-S166` | Abort before start honored | `PASS` |
| `R8A-S167` | Abort between stages honored | `PASS` |
| `R8A-S168` | Abort after submit rejects stale result | `PASS` |
| `R8A-S169` | Current GPU device resolved per request | `PASS` |
| `R8A-S170` | Device epoch attached | `PASS` |
| `R8A-S171` | Runtime epoch attached | `PASS` |
| `R8A-S172` | R8 policy normalized | `PASS` |
| `R8A-S173` | Canonical lowpass executed | `PASS` |
| `R8A-S174` | CPU scaling absent | `PASS` |
| `R8A-S175` | Compatibility exact-size passthrough preserved | `PASS` |
| `R8A-S176` | Scaled compatibility bytes rejected | `PASS` |
| `R8A-S177` | Canonical surface ID present | `PASS` |
| `R8A-S178` | Canonical receipt ID present | `PASS` |
| `R8A-S179` | Canonical receipt digest recomputed | `PASS` |

## 17.7 Actual Kernel Identity Propagation

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S180` | Actual kernel ID derived from lowpass receipt | `PASS` |
| `R8A-S181` | Kernel contract ID derived from receipt | `PASS` |
| `R8A-S182` | Kernel contract digest derived from receipt | `PASS` |
| `R8A-S183` | Parameter ABI ID derived from receipt | `PASS` |
| `R8A-S184` | Planner ID derived from receipt | `PASS` |
| `R8A-S185` | Plan digest derived from receipt | `PASS` |
| `R8A-S186` | Generated manifest ID derived from receipt | `PASS` |
| `R8A-S187` | Generated manifest digest derived from receipt | `PASS` |
| `R8A-S188` | Shader digest set derived from receipt | `PASS` |
| `R8A-S189` | Hard-coded compatibility kernel removed | `PASS` |
| `R8A-S190` | Historical adapter ID separately named | `PASS` |
| `R8A-S191` | Compatibility result kernel equals lowpass | `PASS` |
| `R8A-S192` | Broker result kernel equals lowpass | `PASS` |
| `R8A-S193` | Export receipt kernel equals lowpass | `PASS` |
| `R8A-S194` | R9A expected kernel equals lowpass | `PASS` |
| `R8A-S195` | Kernel mismatch fail closed | `PASS` |
| `R8A-S196` | Contract mismatch fail closed | `PASS` |
| `R8A-S197` | Contract digest mismatch fail closed | `PASS` |
| `R8A-S198` | ABI mismatch fail closed | `PASS` |
| `R8A-S199` | Planner mismatch fail closed | `PASS` |
| `R8A-S200` | Plan digest mismatch fail closed | `PASS` |
| `R8A-S201` | Manifest mismatch fail closed | `PASS` |
| `R8A-S202` | Shader digest mismatch fail closed | `PASS` |
| `R8A-S203` | Caller-forged identity negative control | `PASS` |
| `R8A-S204` | Receipt digest mismatch negative control | `PASS` |
| `R8A-S205` | Identity bundle self-hash | `PASS` |
| `R8A-S206` | Identity parity report emitted | `PASS` |
| `R8A-S207` | Zero canonical identity fallback strings | `PASS` |

## 17.8 Repeated Device-Loss Re-Registration

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S208` | Facade authority record exists | `PASS` |
| `R8A-S209` | Current state referenced indirectly | `PASS` |
| `R8A-S210` | Recovery closure avoids first-state capture | `PASS` |
| `R8A-S211` | Participant registered once per bridge | `PASS` |
| `R8A-S212` | Participant unregister retained | `PASS` |
| `R8A-S213` | Old bridge unregister before replacement | `PASS` |
| `R8A-S214` | Current state dispose idempotent | `PASS` |
| `R8A-S215` | Tensor pipeline dispose once | `PASS` |
| `R8A-S216` | EWA pipeline dispose once | `PASS` |
| `R8A-S217` | Lease release once | `PASS` |
| `R8A-S218` | State promise cleared on loss | `PASS` |
| `R8A-S219` | Recovery generation increments | `PASS` |
| `R8A-S220` | Pending job rejected on loss | `PASS` |
| `R8A-S221` | Next request acquires fresh lease | `PASS` |
| `R8A-S222` | Next request rebuilds tensor pipeline | `PASS` |
| `R8A-S223` | Next request rebuilds EWA pipeline | `PASS` |
| `R8A-S224` | New device epoch recorded | `PASS` |
| `R8A-S225` | Stale state dispatch rejected | `PASS` |
| `R8A-S226` | Stale completion rejected | `PASS` |
| `R8A-S227` | Loss cycle one pass | `PASS` |
| `R8A-S228` | Loss cycle two pass | `PASS` |
| `R8A-S229` | Loss cycle three pass | `PASS` |
| `R8A-S230` | Epoch one to two exact | `PASS` |
| `R8A-S231` | Epoch two to three exact | `PASS` |
| `R8A-S232` | Epoch three to four exact | `PASS` |
| `R8A-S233` | Participant count plateau one | `PASS` |
| `R8A-S234` | No old bridge participant leak | `PASS` |
| `R8A-S235` | Executor cache invalidated on loss | `PASS` |
| `R8A-S236` | Executor registration remains authoritative | `PASS` |
| `R8A-S237` | Repeated-loss report emitted | `PASS` |

## 17.9 Receipts Telemetry and Build Closure

| Gate | Requirement | Status at source completion |
|---|---|---|
| `R8A-S238` | Parser pass counter monotonic | `PASS` |
| `R8A-S239` | Parser fail counter monotonic | `PASS` |
| `R8A-S240` | Executor registration counter monotonic | `PASS` |
| `R8A-S241` | Executor collision counter monotonic | `PASS` |
| `R8A-S242` | Executor request counter monotonic | `PASS` |
| `R8A-S243` | Identity propagation counter monotonic | `PASS` |
| `R8A-S244` | Identity mismatch counter monotonic | `PASS` |
| `R8A-S245` | Recovery invalidation counter monotonic | `PASS` |
| `R8A-S246` | Recovery rebuild counter monotonic | `PASS` |
| `R8A-S247` | Stale epoch rejection counter monotonic | `PASS` |
| `R8A-S248` | WGPU export success counter monotonic | `PASS` |
| `R8A-S249` | WGPU export failure counter monotonic | `PASS` |
| `R8A-S250` | Explicit fallback counter monotonic | `PASS` |
| `R8A-S251` | Silent fallback counter zero | `PASS` |
| `R8A-S252` | R8A final receipt schema exact | `PASS` |
| `R8A-S253` | R8A final receipt child digests exact | `PASS` |

## 17.10 Physical Revalidation Gates

| Gate | Requirement | R8A source status | Owner |
|---|---|---|---|
| `R8A-P001` | Packaged Electron active module parse and import | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |
| `R8A-P002` | Physical canonical broker executor dispatch | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |
| `R8A-P003` | Physical actual kernel identity parity | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |
| `R8A-P004` | Physical repeated device-loss three-cycle recovery | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |
| `R8A-P005` | Physical WGPU-only failure propagation | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |
| `R8A-P006` | Physical successful PNG WebP JXL export receipts | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |
| `R8A-P007` | Physical zero silent fallback observation | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |
| `R8A-P008` | R9A product reference oracle regression | `DEFERRED` | `TDT-RESAMPLE-RUNTIME-01-R9A` |


---

# 18. Completion States

## 18.1 Source-complete state

```text
RESAMPLE_RUNTIME_R8A_ACTIVE_RUNTIME_TRUTH_CLOSURE_SEALED_AWAITING_R9A_PHYSICAL_GPU

253 SOURCE PASS
8 PHYSICAL DEFERRED
0 FAIL

activeRequiredUnparsedCount = 0
canonicalExecutorRegistered = true
actualKernelIdentityPropagated = true
repeatedDeviceLossCyclesPassed = 3
silentFallbackCount = 0
productionPointerMutated = false
localActivationPointerMutated = false
R9ThroughR13ReceiptsCurrent = false
```

## 18.2 Forbidden source state

The following is invalid:

```text
253 SOURCE PASS
8 PHYSICAL PASS
```

unless the physical evidence was produced by the R9A packaged Windows execution authority.

## 18.3 Next authority

```text
TDT-RESAMPLE-RUNTIME-01-R9A

Production Validation Counter Sampling /
Single-Submit Multi-Stage Command Graph /
Uniform Ring Allocation /
Queue Fence Retirement /
Physical GPU Performance Closure
```

---

# 19. Final Seal Rule

R8A is sealed only when all admitted JavaScript can be parsed according to its actual loading semantics, the broker has one live canonical R8 executor, every canonical receipt reports the executed kernel identity, repeated device loss invalidates every newly rebuilt state, and no WGPU-only export failure can disappear behind a warning and bare return.

A visually quiet failure is still a failure. R8A turns it into evidence.
