# TDT-RUNTIME-SSOT-01-R1
## Vite Authoritative Entry / Vue Application Shell / Pinia Serializable State Ownership / Runtime Service Isolation / Deterministic Boot Receipt Seal

- **Patch ID:** `TDT-RUNTIME-SSOT-01-R1`
- **Status:** Specification
- **Target:** DadumDadum renderer bootstrap, UI shell, state ownership, non-serializable runtime isolation, deterministic boot proof
- **Baseline:** `44_TDT_BLENDIF_WGPU_01_10_APPLIED`
- **Revises:** `TDT-RUNTIME-SSOT-01`
- **Depends on:** `TDT-BLENDIF-WGPU-04` through `TDT-BLENDIF-WGPU-10` applied baseline
- **Promotion class:** P0 runtime truth seal
- **Primary build authority:** Vite module graph and generated Vite build manifest
- **Primary UI authority:** Vue 3 application shell
- **Primary serializable state authority:** Pinia stores
- **Primary non-serializable runtime authority:** Runtime Service Container
- **Primary runtime composition authority:** Generated Dadum Runtime Manifest
- **Primary boot proof:** Deterministic Boot Receipt Seal
- **Mutation policy:** Direct source migration, no runtime patch injector, no silent compatibility fallback
- **Migration policy:** Strangler migration allowed, dual product authority forbidden

---

# 0. Purpose

Seal a single renderer entry and divide DadumDadum ownership into explicit, non-overlapping layers.

The patch must make the following statement mechanically true:

> DadumDadum renderer execution begins from one Vite-owned entry, mounts one Vue application shell, stores only serializable application state in Pinia, keeps GPU, Worker, Codec, Native, Blob, Canvas, and other live resources inside explicit Runtime Services, and may enter `READY` only after the generated build graph, runtime module identities, capability ownership, service activation, and deterministic boot receipt have all passed.

This patch is not a cosmetic Vue rewrite.

It is a runtime authority migration that must answer, without inference:

- which file entered the renderer,
- which logical runtime modules were admitted by the build,
- which component owns each visible UI region,
- which Pinia store owns each serializable state field,
- which Runtime Service owns each non-serializable object,
- which module owns each capability,
- whether a legacy script was temporarily admitted,
- which global writes that legacy script attempted,
- whether the application is actually usable,
- whether two equivalent builds and boots produce the same sealed result.

---

# 1. Revision Relationship to TDT-RUNTIME-SSOT-01

`TDT-RUNTIME-SSOT-01` proposed an authoritative runtime manifest loaded by `app/boot.js`.

`TDT-RUNTIME-SSOT-01-R1` preserves its invariants but changes the top-level authority model.

## 1.1 Previous model

```text
index.html
→ boot.js
→ SSOT.manifest.json
→ dynamic module loading
→ runtime registration
→ activation
```

## 1.2 R1 model

```text
index.html
→ /src/main.ts
→ Vite module graph
→ generated Vite build manifest
→ generated Dadum Runtime Manifest
→ Vue application shell
→ Pinia state projections
→ Runtime Service activation
→ deterministic boot receipt
```

## 1.3 Preserved invariants

The following previous requirements remain mandatory:

- one executable renderer root,
- required module fail-closed,
- runtime module identity before capability adoption,
- unique capability ownership,
- placeholder rejection,
- deterministic receipt payload separated from telemetry,
- `READY` forbidden after required failure,
- safe diagnostic state permitted without product activation.

## 1.4 Superseded implementation detail

The following previous implementation detail is superseded:

```text
Raw source index.html
→ manually maintained boot.js
→ hand-authored script path manifest
```

Vite now owns static JavaScript reachability and emitted chunk identity.

A Dadum Runtime Manifest still exists, but it describes logical runtime modules, capabilities, service ownership, and build-bound identities. It must not compete with Vite by independently discovering arbitrary source files at runtime.

---

# 2. Baseline Findings

## 2.1 Renderer has no Vue, Vite, or Pinia authority

Current root `package.json` contains Electron, electron-builder, native build tools, JSZip, pako, and sharp.

It does not declare:

```text
vue
pinia
vite
@vitejs/plugin-vue
typescript
vue-tsc
```

Therefore no current Vue application shell, Vite build graph, Pinia state authority, or TypeScript renderer contract exists.

## 2.2 Current index is an executable aggregation surface

Static inspection of `app/index.html` finds:

```text
40 external executable script tags
7 inline executable script blocks
```

The page directly chooses execution order across UI, WebGL, WebGPU, patches, renderers, export paths, and compatibility layers.

Therefore current runtime meaning depends on HTML script order and global mutation order.

## 2.3 Current renderer mixes multiple path dialects

Current HTML uses paths including:

```text
./module.js
module.js
./js/module.js
engine/passes/module.js
./app/qwave/module.js
./app/core/module.js
```

The Electron static server currently strips an initial `/app/` segment from incoming URLs.

That makes some source paths work only because the server rewrites them.

This behavior is deployment-coupled and must not remain an implicit renderer contract.

## 2.4 Current product source and served build are the same tree

Electron production currently serves the source `app/` directory directly.

```text
Electron main
→ local HTTP server
→ source app/
→ index.html
```

A Vite migration must instead serve an emitted renderer build in production.

```text
Electron main
→ local COOP/COEP server
→ dist/renderer/
→ emitted index.html and hashed assets
```

## 2.5 Existing code uses global state and direct DOM access as implicit buses

The current application contains extensive `window` or `globalThis` publication and direct DOM lookup.

These patterns currently carry several different meanings at once:

- module presence,
- capability presence,
- active document state,
- image surface ownership,
- UI state,
- codec availability,
- pipeline readiness,
- compatibility patch activation.

R1 must split those meanings into Pinia state, Runtime Services, and explicit capability records.

## 2.6 Existing TDT-RUNTIME-SSOT-01 draft logic may be reused only as typed modules

The following logic is conceptually reusable:

- canonical JSON,
- SHA-256 helpers,
- boot state transitions,
- capability registry,
- placeholder rejection,
- deterministic receipt construction,
- safe diagnostic policy.

It must be ported into the Vite source graph and typed contracts.

The pre-Vite manual source loader must not remain a second product boot authority.

---

# 3. Authority Model

R1 defines five distinct authorities.

No authority may silently absorb another.

## 3.1 Vite Build Authority

Vite owns:

- renderer executable entry,
- source module reachability,
- dependency resolution,
- chunk emission,
- static asset emission,
- Worker module bundling,
- shader asset resolution,
- production asset hashing,
- generated Vite build manifest.

Vite does not own:

- active document state,
- GPU resource lifetime,
- Worker job lifetime,
- encoder selection policy,
- final export surface authority,
- product readiness.

## 3.2 Vue Application Shell Authority

Vue owns:

- component tree,
- rendered DOM,
- routing or view switching,
- accessible control presentation,
- event capture from the user,
- display projection of store state,
- safe diagnostic screen rendering.

Vue components do not own:

- `GPUDevice`,
- `GPUTexture`,
- `GPUBuffer`,
- `GPUComputePipeline`,
- Worker instances,
- WASM module instances,
- decoder handles,
- encoder handles,
- Blob URL lifetime,
- final export surface truth.

## 3.3 Pinia Serializable State Authority

Pinia owns only serializable state that can be represented canonically as JSON.

Examples:

- boot status,
- selected file metadata,
- active document ID,
- requested processing options,
- requested export options,
- progress values,
- stable diagnostic records,
- preview viewport transform,
- opaque runtime resource IDs,
- surface revision numbers,
- receipt digest references.

Pinia must never own live runtime resources.

## 3.4 Runtime Service Authority

Runtime Services own live, non-serializable, lifetime-bound resources.

Examples:

- GPU adapter and device,
- textures and buffers,
- pipeline objects,
- command encoders,
- Web Workers,
- native decoder bridge handles,
- WASM module instances,
- Canvas and OffscreenCanvas instances,
- `ImageBitmap`,
- Blob and Object URL lifetime,
- decoder and encoder registries,
- in-flight jobs,
- cancellation tokens,
- device epochs,
- resource disposal.

## 3.5 Runtime Composition and Receipt Authority

The generated Dadum Runtime Manifest and Receipt Service own:

- logical runtime module identity,
- module version,
- required or optional status,
- dependency order,
- capability ownership,
- service ownership,
- activated implementation identity,
- build graph digest,
- boot plan digest,
- stable activation outcome,
- deterministic seal.

---

# 4. Core Invariants

## INV-R1-01. One renderer executable entry

Source `app/index.html` may contain exactly one executable module entry:

```html
<script type="module" src="/src/main.ts"></script>
```

No additional executable inline script or script source is permitted.

Production `dist/renderer/index.html` may contain only Vite-generated entry and preload tags derived from that graph.

## INV-R1-02. Vite graph owns all product JavaScript reachability

Every product JavaScript or TypeScript module must be reachable from `/src/main.ts` through:

- static ESM imports,
- typed dynamic imports declared in the runtime module registry,
- Vite-controlled Worker URLs,
- Vite-controlled asset URLs.

Arbitrary DOM script injection is forbidden outside the explicit temporary Legacy Runtime Adapter.

## INV-R1-03. Build output, not source app, is served in production

Production Electron must serve:

```text
dist/renderer/
```

It must not serve source `app/` as the product renderer root.

## INV-R1-04. Vue owns product DOM

Product UI DOM must be created by Vue components.

Direct product DOM mutation outside Vue is forbidden except:

- root mount fallback before Vue initialization,
- Safe Diagnostic emergency renderer if Vue itself fails,
- explicitly isolated Legacy DOM Island during migration.

## INV-R1-05. Pinia state is canonically serializable

The full state returned by each production Pinia store must pass:

```ts
JSON.stringify(state)
canonicalize(state)
structuredClone(state)
```

without custom replacers, dropped fields, or exceptions.

## INV-R1-06. No live runtime object in Pinia

The following types are forbidden in Pinia state:

```text
GPUAdapter
GPUDevice
GPUTexture
GPUTextureView
GPUBuffer
GPUSampler
GPUShaderModule
GPUComputePipeline
GPURenderPipeline
GPUCommandEncoder
Worker
MessagePort
WebAssembly.Module
WebAssembly.Instance
HTMLCanvasElement
OffscreenCanvas
CanvasRenderingContext2D
WebGLRenderingContext
WebGL2RenderingContext
ImageBitmap
ImageData
Blob
File
ReadableStream
AbortController
Promise
Function
Map
Set
WeakMap
WeakSet
DOM Node
native addon handle
```

Serializable metadata about these objects is allowed.

## INV-R1-07. Runtime objects are referenced by opaque IDs

Pinia may retain only opaque references such as:

```ts
surfaceId: string | null
jobId: string | null
workerLeaseId: string | null
receiptId: string | null
```

The corresponding object must remain owned by a Runtime Service registry.

## INV-R1-08. Runtime Service ownership is unique

Each live resource class and capability must have one authoritative service owner.

Two services may not both claim ownership of the same resource ID or capability ID.

## INV-R1-09. Components express intent, not engine mutations

Vue components may emit typed commands or call an application controller.

They must not directly:

- create a GPU device,
- allocate textures,
- spawn Workers,
- call encoders,
- decide final export surface fallback,
- mutate global engine state.

## INV-R1-10. Required Runtime Service failure is fail-closed

Failure of a required service forbids `READY` and `DEGRADED_PRODUCT`.

Allowed terminal state:

```text
SAFE_DIAGNOSTIC
```

## INV-R1-11. Optional feature failure is explicit

An optional capability may fail only if:

- no active required module consumes it,
- its UI entry is disabled,
- the receipt records its stable failure code,
- no alternate implementation is adopted silently,
- the runtime state is explicitly `DEGRADED`.

## INV-R1-12. Runtime module identity precedes activation

A module must declare a stable descriptor before its `activate()` function may run.

## INV-R1-13. Capability identity precedes use

A function existing on `window` or `globalThis` does not prove capability availability.

Only a capability published by an activated runtime module is authoritative.

## INV-R1-14. Legacy execution is transitional and measured

Any temporarily admitted legacy script must declare:

- stable legacy module ID,
- source path,
- source digest,
- required status,
- load order,
- allowed global writes,
- provided capabilities,
- retirement target.

Unexpected global writes fail the legacy module activation.

## INV-R1-15. No silent source fallback

If the final processed surface is unavailable, preview or export must fail with a stable error.

It must not silently use the original source surface.

## INV-R1-16. Receipt seal excludes volatile telemetry

Timestamps, durations, user agent strings, random IDs, hardware labels, and raw stacks must not affect the deterministic seal digest.

## INV-R1-17. Development and production receipts are distinct profiles

A development HMR receipt is not promotion evidence.

The receipt must contain:

```text
profile: development | production
promotable: false | true
```

Only a production receipt may be used for release promotion.

## INV-R1-18. HMR cannot preserve stale runtime authority

On development HMR invalidation of a runtime module, all resources owned by that module must be disposed or the page must perform a full reload.

HMR must not leave a previous GPU, Worker, or Codec instance authoritative under a new source module identity.

## INV-R1-19. Device loss increments runtime epoch

WebGPU device loss must:

- invalidate all GPU resource IDs from the previous epoch,
- clear pipeline and bind group caches,
- fail in-flight GPU jobs,
- publish a stable diagnostic event,
- require explicit reinitialization before product use resumes.

## INV-R1-20. One state write path per domain

Each Pinia domain has one authoritative action or projection layer for state mutation.

Legacy modules may not mutate Pinia state directly.

## INV-R1-21. Electron preload is a typed host boundary

The preload bridge may expose one frozen namespace, for example:

```ts
window.dadumHost
```

It must not expose Node globals, mutable service objects, or arbitrary IPC send methods.

## INV-R1-22. Source path rewrite is not a renderer contract

The renderer must not rely on Electron stripping `/app/` from URL paths.

All product asset references must be resolved by Vite or by an explicit Runtime Asset Registry.

## INV-R1-23. Same build and same activation result produce the same seal

For the same emitted build, runtime manifest, capability outcome, and stable error outcome:

```text
viteManifestDigest
runtimePlanDigest
servicePlanDigest
bootSealSha256
```

must be byte-identical across repeated boots.

## INV-R1-24. Safe Diagnostic is not product readiness

The diagnostic shell may remain usable for:

- viewing stable errors,
- exporting the boot receipt,
- copying diagnostics,
- reloading the application.

It may not decode, process, preview, or export images.

---

# 5. Target Source Layout

The renderer must be reorganized around an explicit Vite root.

```text
project-root/
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ electron.mjs
├─ preload.cjs
├─ tools/
│  ├─ generate-runtime-manifest.mjs
│  ├─ verify-index-entry.mjs
│  ├─ verify-pinia-serializable.mjs
│  ├─ verify-runtime-ownership.mjs
│  └─ verify-boot-determinism.mjs
├─ app/
│  ├─ index.html
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ App.vue
│  │  ├─ env.d.ts
│  │  ├─ application/
│  │  │  ├─ app-controller.ts
│  │  │  ├─ app-command.ts
│  │  │  ├─ app-event.ts
│  │  │  └─ store-projector.ts
│  │  ├─ boot/
│  │  │  ├─ bootstrap-renderer.ts
│  │  │  ├─ boot-state.ts
│  │  │  ├─ capability-registry.ts
│  │  │  ├─ canonical-json.ts
│  │  │  ├─ generated-runtime-manifest.d.ts
│  │  │  ├─ runtime-module.ts
│  │  │  ├─ runtime-modules.ts
│  │  │  ├─ runtime-receipt.ts
│  │  │  └─ stable-error.ts
│  │  ├─ stores/
│  │  │  ├─ boot.store.ts
│  │  │  ├─ document.store.ts
│  │  │  ├─ processing.store.ts
│  │  │  ├─ preview.store.ts
│  │  │  ├─ export.store.ts
│  │  │  └─ diagnostics.store.ts
│  │  ├─ runtime/
│  │  │  ├─ service-container.ts
│  │  │  ├─ service-token.ts
│  │  │  ├─ resource-id.ts
│  │  │  ├─ runtime-epoch.ts
│  │  │  ├─ gpu/
│  │  │  ├─ workers/
│  │  │  ├─ codecs/
│  │  │  ├─ decode/
│  │  │  ├─ pipeline/
│  │  │  ├─ preview/
│  │  │  └─ export/
│  │  ├─ components/
│  │  ├─ views/
│  │  │  ├─ BootView.vue
│  │  │  ├─ WorkspaceView.vue
│  │  │  └─ SafeDiagnosticView.vue
│  │  ├─ legacy/
│  │  │  ├─ legacy-runtime-adapter.ts
│  │  │  ├─ legacy-dom-island.ts
│  │  │  ├─ legacy-global-audit.ts
│  │  │  └─ generated-legacy-manifest.ts
│  │  └─ styles/
│  ├─ shaders/
│  ├─ workers/
│  ├─ wasm/
│  ├─ assets/
│  └─ legacy-source/
├─ native/
└─ dist/
   └─ renderer/
```

## 5.1 Legacy source placement

Existing scripts not yet migrated to ESM may be moved under:

```text
app/legacy-source/
```

This directory is not automatically executable.

Only files included in the generated Legacy Runtime Manifest may be loaded by the temporary adapter.

## 5.2 No `public/` executable dumping ground

Vite `publicDir` must not contain product JavaScript that can bypass the module graph.

Allowed public assets are limited to immutable non-executable files that cannot reasonably be imported through the source graph.

All executable code must remain in the Vite graph or the explicit legacy manifest.

---

# 6. Package and Toolchain Contract

## 6.1 Required package additions

```json
{
  "dependencies": {
    "pinia": "<locked-version>",
    "vue": "<locked-version>"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "<locked-version>",
    "typescript": "<locked-version>",
    "vite": "<locked-version>",
    "vue-tsc": "<locked-version>"
  }
}
```

Exact versions must be pinned through `package-lock.json`.

Floating CDN dependencies are forbidden.

## 6.2 Required scripts

```json
{
  "scripts": {
    "dev:renderer": "vite --config vite.config.ts",
    "build:renderer": "vite build --config vite.config.ts",
    "typecheck:renderer": "vue-tsc --noEmit",
    "verify:runtime-entry": "node tools/verify-index-entry.mjs",
    "verify:pinia": "node tools/verify-pinia-serializable.mjs",
    "verify:runtime-ownership": "node tools/verify-runtime-ownership.mjs",
    "verify:boot-determinism": "node tools/verify-boot-determinism.mjs",
    "verify:renderer": "npm run typecheck:renderer && npm run build:renderer && npm run verify:runtime-entry && npm run verify:pinia && npm run verify:runtime-ownership && npm run verify:boot-determinism"
  }
}
```

Existing Electron packaging scripts must depend on `build:renderer` before packaging.

## 6.3 Vite configuration minimum

```ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { dadumRuntimeManifestPlugin } from './tools/vite-runtime-manifest-plugin';

export default defineConfig(({ mode }) => ({
  root: 'app',
  base: '/',
  publicDir: false,
  plugins: [
    vue(),
    dadumRuntimeManifestPlugin({ profile: mode }),
  ],
  assetsInclude: [
    '**/*.wgsl',
    '**/*.glsl',
    '**/*.frag',
    '**/*.vert',
    '**/*.wasm',
    '**/*.icc',
    '**/*.cube',
  ],
  build: {
    outDir: '../dist/renderer',
    emptyOutDir: true,
    manifest: true,
    sourcemap: mode !== 'production',
    target: 'es2022',
  },
}));
```

The final implementation may adjust paths, but the following truths are mandatory:

- one Vite root,
- one renderer output directory,
- build manifest enabled,
- source output cleared before build,
- executable public directory disabled,
- runtime manifest plugin active.

## 6.4 Shader and Worker resolution

WGSL and GLSL must be loaded through one of:

```ts
import shaderSource from './shader.wgsl?raw';
```

or:

```ts
const shaderUrl = new URL('./shader.wgsl', import.meta.url);
```

Workers must use:

```ts
new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
```

String-concatenated Worker paths are forbidden.

## 6.5 WASM resolution

WASM modules must be resolved through Vite-controlled URLs or explicit runtime asset records.

A WASM capability must report:

- implementation ID,
- source asset digest,
- instantiated version,
- supported feature set,
- initialization result.

---

# 7. Electron Main and Static Server Contract

## 7.1 Development mode

Electron may load a Vite development server only when an explicit development environment variable is present.

Example:

```text
DADUM_RENDERER_DEV_URL=http://127.0.0.1:5173
```

Development mode must set:

```text
profile = development
promotable = false
```

## 7.2 Production mode

Production Electron must serve:

```text
<project-or-resources>/dist/renderer/
```

It must not serve source `app/`.

## 7.3 COOP and COEP

The production static server must preserve:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

for HTML, JavaScript, Worker, WASM, shader, and relevant binary resources.

## 7.4 MIME completeness

The production server must explicitly support at least:

```text
.html   text/html
.js     application/javascript
.mjs    application/javascript
.css    text/css
.json   application/json
.wasm   application/wasm
.wgsl   text/plain or text/wgsl
.glsl   text/plain
.frag   text/plain
.vert   text/plain
.png    image/png
.jpg    image/jpeg
.webp   image/webp
.icc    application/vnd.iccprofile or application/octet-stream
```

## 7.5 No path rewrite dependency

The `/app/` stripping rule must be removed from the product asset contract.

A compatibility rewrite may exist only during development and must emit a deprecation diagnostic.

No production module or asset may require it.

## 7.6 Preload namespace

The preload script must expose one frozen API namespace.

Example:

```ts
interface DadumHostApi {
  nativeDecoderStatus(): Promise<NativeDecoderStatus>;
  decodeNativeBuffer(bytes: ArrayBuffer, options: NativeDecodeOptions): Promise<NativeDecodedSurfaceDto>;
  decodeNativePath(path: string, options: NativeDecodeOptions): Promise<NativeDecodedSurfaceDto>;
}
```

Renderer code must not call raw IPC channels.

---

# 8. Vue Application Shell Contract

## 8.1 Root application states

`App.vue` must render exactly one primary state branch:

```text
BOOTING
SAFE_DIAGNOSTIC
READY
DEGRADED
```

Example:

```vue
<template>
  <BootView v-if="bootStore.isBooting" />
  <SafeDiagnosticView v-else-if="bootStore.isSafeDiagnostic" />
  <WorkspaceView v-else />
</template>
```

## 8.2 Mount order

The shell may mount before runtime activation so the user can see boot progress.

Product controls must remain disabled until a valid receipt has been sealed.

```text
Vue mount
≠
product ready
```

## 8.3 Component side-effect rule

Component `setup()` may:

- read stores,
- emit typed user intents,
- register component-scoped DOM listeners,
- manage presentational refs.

Component `setup()` may not:

- allocate GPU resources,
- initialize codecs,
- install globals,
- spawn long-lived Workers,
- activate runtime modules,
- create product-wide singleton services.

## 8.4 DOM lookup rule

Outside the Legacy DOM Island, product code must not use global selectors such as:

```text
document.getElementById
document.querySelector
document.querySelectorAll
```

for application control wiring.

Vue refs and component props must replace those lookups.

## 8.5 Accessible fail-closed UI

When runtime activation fails:

- workspace controls are not rendered or are disabled,
- focus moves to the diagnostic heading,
- stable error code is visible,
- receipt export remains available,
- retry performs a full boot reset,
- no background image job remains active.

## 8.6 Legacy DOM Island

Temporary legacy UI may exist only inside an explicit component such as:

```text
LegacyDomIsland.vue
```

The island must:

- own one root element,
- prohibit selectors escaping that root where technically possible,
- be marked with a retirement patch ID,
- expose typed events to the Vue application,
- not mutate Pinia directly,
- not own final runtime authority.

---

# 9. Pinia Serializable State Ownership

## 9.1 State contract

Every store must declare:

```ts
interface StoreEnvelope {
  schemaVersion: number;
  revision: number;
}
```

Every authoritative mutation increments `revision` exactly once.

## 9.2 Boot store

```ts
interface BootState {
  schemaVersion: 1;
  revision: number;
  phase:
    | 'IDLE'
    | 'SHELL_MOUNTED'
    | 'BUILD_MANIFEST_VALIDATING'
    | 'RUNTIME_PLAN_VALIDATING'
    | 'SERVICES_INITIALIZING'
    | 'MODULES_ACTIVATING'
    | 'RECEIPT_SEALING'
    | 'READY'
    | 'DEGRADED'
    | 'SAFE_DIAGNOSTIC';
  profile: 'development' | 'production';
  promotable: boolean;
  stableErrorCode: string | null;
  failedModuleId: string | null;
  failedServiceId: string | null;
  bootSealSha256: string | null;
  buildDigest: string | null;
  runtimePlanDigest: string | null;
}
```

## 9.3 Document store

```ts
interface DocumentState {
  schemaVersion: 1;
  revision: number;
  activeDocumentId: string | null;
  sourceFile: null | {
    name: string;
    size: number;
    mime: string;
    lastModified: number;
  };
  decoded: null | {
    width: number;
    height: number;
    storage: 'rgba8unorm' | 'rgba16float' | 'other';
    sourceFormat: string;
    hasTransparency: boolean;
    colorContractId: string | null;
    surfaceId: string;
    surfaceRevision: number;
  };
}
```

The `File`, decoded byte array, `ImageBitmap`, and GPU texture are not stored here.

## 9.4 Processing store

```ts
interface ProcessingState {
  schemaVersion: 1;
  revision: number;
  options: ProcessingOptionsDto;
  activeJobId: string | null;
  jobState: 'IDLE' | 'QUEUED' | 'RUNNING' | 'CANCELLING' | 'SUCCEEDED' | 'FAILED';
  progress: number;
  sourceSurfaceRevision: number | null;
  finalSurfaceId: string | null;
  finalSurfaceRevision: number | null;
  appliedPipelineReceiptId: string | null;
}
```

## 9.5 Preview store

```ts
interface PreviewState {
  schemaVersion: 1;
  revision: number;
  presentedSurfaceId: string | null;
  presentedSurfaceRevision: number | null;
  zoom: number;
  panX: number;
  panY: number;
  fitMode: 'contain' | 'actual' | 'custom';
  splitView: number | null;
}
```

The preview Canvas or GPU context is not stored here.

## 9.6 Export store

```ts
interface ExportState {
  schemaVersion: 1;
  revision: number;
  request: ExportRequestDto;
  activeJobId: string | null;
  status: 'IDLE' | 'VALIDATING' | 'ENCODING' | 'SUCCEEDED' | 'FAILED';
  sourceSurfaceId: string | null;
  sourceSurfaceRevision: number | null;
  encoderId: string | null;
  receiptId: string | null;
  stableErrorCode: string | null;
}
```

The encoded Blob and Object URL are owned by Export Runtime Service.

## 9.7 Diagnostics store

```ts
interface DiagnosticRecord {
  sequence: number;
  severity: 'info' | 'warning' | 'error' | 'fatal';
  code: string;
  phase: string;
  moduleId: string | null;
  serviceId: string | null;
  messageKey: string;
  detail: Record<string, string | number | boolean | null>;
}
```

Raw stack traces belong to volatile telemetry, not deterministic store snapshots used for promotion.

## 9.8 Mutation rule

Production store state must be changed through declared actions or the Store Projector.

Direct component mutation such as:

```ts
store.$state.someNested.value = x;
```

is forbidden for authoritative fields.

## 9.9 Persistence rule

No store is persisted automatically in R1.

Any future persistence must declare:

- schema version,
- migration function,
- field allowlist,
- validation gate,
- corruption behavior,
- whether it participates in boot digest.

---

# 10. Application Command and Projection Flow

The preferred control flow is:

```text
Vue Component
→ typed AppCommand
→ AppController
→ RuntimeOrchestrator
→ Runtime Service
→ typed AppEvent
→ StoreProjector
→ Pinia State
→ Vue projection
```

## 10.1 Command example

```ts
type AppCommand =
  | { type: 'OPEN_FILE'; file: File }
  | { type: 'RUN_PIPELINE'; optionsRevision: number }
  | { type: 'CANCEL_JOB'; jobId: string }
  | { type: 'EXPORT'; requestRevision: number };
```

The `File` may appear transiently in a command payload.

It must not be retained in Pinia.

## 10.2 Event example

```ts
type AppEvent =
  | { type: 'SOURCE_DECODED'; document: DecodedDocumentDto }
  | { type: 'PIPELINE_PROGRESS'; jobId: string; progress: number }
  | { type: 'PIPELINE_SUCCEEDED'; jobId: string; finalSurface: SurfaceRefDto }
  | { type: 'EXPORT_FAILED'; jobId: string; code: string };
```

## 10.3 No dual mutation

A Runtime Service may not both mutate Pinia directly and emit an event for the same state transition.

One projection path must be chosen.

---

# 11. Runtime Service Isolation

## 11.1 Service Container

The renderer must create one Runtime Service Container per application boot epoch.

```ts
interface RuntimeService {
  readonly id: string;
  initialize(context: RuntimeInitializeContext): Promise<void>;
  dispose(reason: RuntimeDisposeReason): Promise<void> | void;
}
```

## 11.2 Required service set

At minimum, the runtime plan must define ownership for:

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
```

The exact IDs may vary only if the manifest and tests use one canonical set.

## 11.3 Resource Registry

All live resources must be registered under opaque IDs.

```ts
interface RuntimeResourceRecord {
  id: string;
  type: string;
  ownerServiceId: string;
  epoch: number;
  revision: number;
  state: 'ACTIVE' | 'INVALID' | 'DISPOSED';
}
```

The actual object remains private to the service registry.

## 11.4 Runtime epoch

Every boot starts a monotonically increasing runtime epoch.

Device recovery or full runtime reset starts a new epoch.

A resource ID from an earlier epoch must fail lookup with:

```text
E_RUNTIME_STALE_RESOURCE_EPOCH
```

## 11.5 GPU Service

GPU Service owns:

- adapter and device negotiation,
- required feature and limit checks,
- device epoch,
- device lost handling,
- GPU queue access,
- GPU resource factories,
- pipeline cache root,
- GPU diagnostic scope.

No Vue component or Pinia store may call `navigator.gpu.requestAdapter()`.

## 11.6 Worker Registry

Worker Registry owns:

- Worker construction,
- worker implementation identity,
- message protocol version,
- job routing,
- cancellation,
- termination,
- epoch recreation,
- protocol mismatch failure.

A Worker must not be selected by an unversioned global variable.

## 11.7 Decoder Registry

Decoder Registry owns:

- magic byte selection,
- browser decoder admission,
- native decoder admission,
- JXL decoder admission,
- PSD decoder admission,
- decoded surface normalization,
- decoder receipt identity.

## 11.8 Encoder Registry

Encoder Registry owns:

- format to encoder ID mapping,
- encoder availability,
- requested versus applied options,
- output MIME verification,
- signature verification,
- encoder receipt identity.

It must not replace an unavailable requested codec with another format silently.

## 11.9 Pipeline Service

Pipeline Service owns:

- authoritative active processing graph,
- source surface revision binding,
- Q-map and sidecar binding,
- final surface publication,
- cancellation and rollback,
- applied pipeline receipt.

## 11.10 Preview Presenter

Preview Presenter owns:

- Canvas or GPU canvas context,
- presentation surface binding,
- resize observation,
- frame scheduling,
- stale revision rejection.

## 11.11 Export Authority

Export Authority owns:

- final export surface selection,
- final surface revision verification,
- readback policy,
- encoder handoff,
- Blob lifetime,
- download URL lifetime,
- export receipt.

The priority must be:

```text
Explicit final surface
→ authoritative final GPU surface
→ authoritative final CPU mirror
→ fail
```

Original source fallback is forbidden unless the user selected an explicit `Export Original` operation.

## 11.12 Disposal contract

On application teardown, full reload, device loss, or fatal contamination:

- active jobs are cancelled,
- Workers are terminated,
- GPU resources are invalidated,
- Blob URLs are revoked,
- event listeners are removed,
- registries are cleared,
- stale service references become unusable.

---

# 12. Runtime Module Identity and Capability Contract

## 12.1 Module descriptor

Every logical runtime module must use a typed descriptor.

```ts
interface RuntimeModuleDescriptor {
  id: string;
  version: string;
  required: boolean;
  phase: RuntimePhase;
  dependsOn: readonly string[];
  provides: readonly string[];
  consumes: readonly string[];
  ownsServices: readonly string[];
  sourceIdentity: string;
  activate(context: RuntimeModuleContext): Promise<RuntimeModuleActivation>;
}
```

## 12.2 Module phases

Canonical phase order:

```text
foundation
host
state
resources
decode
pipeline
preview
export
ui-finalize
```

## 12.3 Static module registry

`runtime-modules.ts` must statically enumerate admitted logical modules.

Example:

```ts
import { gpuRuntimeModule } from '../runtime/gpu/gpu.module';
import { pipelineRuntimeModule } from '../runtime/pipeline/pipeline.module';
import { exportRuntimeModule } from '../runtime/export/export.module';

export const runtimeModules = [
  gpuRuntimeModule,
  pipelineRuntimeModule,
  exportRuntimeModule,
] as const;
```

Unlisted runtime modules cannot activate.

## 12.4 Capability ownership

Each capability has one active owner.

Example:

```text
capability: dadum.pipeline.authoritative
owner: dadum.module.pipeline-v1
```

A capability collision is fatal.

## 12.5 Placeholder rejection

Objects marked as placeholders, stubs, mocks, or unavailable adapters cannot publish production capabilities.

Forbidden authority markers include:

```text
__dk_placeholder
__stub
__mock
implemented: false
status: placeholder
```

## 12.6 Required and optional modules

A required module failure enters `SAFE_DIAGNOSTIC`.

An optional module failure may enter `DEGRADED` only when all consumers also mark it optional.

## 12.7 Activation result

```ts
interface RuntimeModuleActivation {
  status: 'ACTIVE' | 'DEGRADED' | 'FAILED';
  implementationId: string;
  publishedCapabilities: readonly string[];
  initializedServices: readonly string[];
  stableErrorCode: string | null;
}
```

---

# 13. Generated Dadum Runtime Manifest

## 13.1 Build-time generation

A Vite build plugin or prebuild tool must emit:

```text
dist/renderer/dadum.runtime-manifest.json
```

It must be generated from:

- static runtime module registry,
- service ownership records,
- source module digests,
- Vite build manifest,
- package lock digest,
- renderer profile.

It must not be hand-edited after build.

## 13.2 Minimum schema

```json
{
  "schemaVersion": 1,
  "appId": "com.dadumdadum.app",
  "buildId": "content-derived-id",
  "profile": "production",
  "promotable": true,
  "viteManifestDigest": "<sha256>",
  "packageLockDigest": "<sha256>",
  "logicalModules": [
    {
      "id": "dadum.module.gpu-v1",
      "version": "1.0.0",
      "required": true,
      "phase": "resources",
      "sourceIdentity": "app/src/runtime/gpu/gpu.module.ts",
      "sourceSha256": "<sha256>",
      "dependsOn": [],
      "provides": ["dadum.gpu.device"],
      "consumes": [],
      "ownsServices": ["dadum.runtime.gpu"]
    }
  ],
  "legacyModules": [],
  "runtimePlanDigest": "<sha256>",
  "manifestSha256": "<sha256>"
}
```

## 13.3 Build ID

`buildId` must be derived from deterministic inputs.

It must not include wall-clock time.

Recommended input:

```text
viteManifestDigest
+ runtimePlanDigest
+ packageLockDigest
+ build profile
```

## 13.4 Manifest self-digest

`manifestSha256` is computed over canonical JSON excluding the `manifestSha256` field itself.

---

# 14. Legacy Runtime Adapter

R1 permits transitional legacy execution because converting every existing script in one patch would create an unreviewable blast radius.

This permission is narrow and temporary.

## 14.1 Legacy module record

```ts
interface LegacyModuleRecord {
  id: string;
  sourceUrl: string;
  sourceSha256: string;
  required: boolean;
  order: number;
  allowedGlobalWrites: readonly string[];
  provides: readonly string[];
  retirementPatchId: string;
}
```

## 14.2 Single legacy loader

Only `legacy-runtime-adapter.ts` may create classic script elements.

All other source code is forbidden from doing so.

## 14.3 Global write audit

For each legacy script:

```text
snapshot global own properties before load
→ load one script
→ snapshot after load
→ diff
→ compare with allowedGlobalWrites
```

Any unexpected write fails activation.

## 14.4 Global adoption

An allowed global is not automatically a capability.

The adapter must validate its shape and explicitly publish it under a capability ID.

## 14.5 Legacy load order

Legacy order is deterministic and included in the runtime plan digest.

No script may infer priority from DOM placement.

## 14.6 Legacy retirement ledger

Every admitted legacy script must have:

- owner,
- purpose,
- active dependency count,
- planned ESM replacement,
- retirement patch ID.

A legacy script without a retirement target fails promotion.

## 14.7 Forbidden legacy behavior

Legacy scripts may not:

- create a second Vue app,
- create or mutate Pinia stores directly,
- replace Runtime Service instances,
- install alternate export authority,
- silently catch required initialization failure,
- inject further scripts,
- publish undeclared globals.

---

# 15. Boot State Machine

## 15.1 Canonical states

```text
IDLE
→ SHELL_MOUNTED
→ BUILD_MANIFEST_VALIDATING
→ RUNTIME_PLAN_VALIDATING
→ SERVICES_INITIALIZING
→ MODULES_ACTIVATING
→ RECEIPT_SEALING
→ READY | DEGRADED

Any required failure
→ SAFE_DIAGNOSTIC
```

## 15.2 State transition table

| Current | Allowed next |
|---|---|
| `IDLE` | `SHELL_MOUNTED`, `SAFE_DIAGNOSTIC` |
| `SHELL_MOUNTED` | `BUILD_MANIFEST_VALIDATING`, `SAFE_DIAGNOSTIC` |
| `BUILD_MANIFEST_VALIDATING` | `RUNTIME_PLAN_VALIDATING`, `SAFE_DIAGNOSTIC` |
| `RUNTIME_PLAN_VALIDATING` | `SERVICES_INITIALIZING`, `SAFE_DIAGNOSTIC` |
| `SERVICES_INITIALIZING` | `MODULES_ACTIVATING`, `SAFE_DIAGNOSTIC` |
| `MODULES_ACTIVATING` | `RECEIPT_SEALING`, `SAFE_DIAGNOSTIC` |
| `RECEIPT_SEALING` | `READY`, `DEGRADED`, `SAFE_DIAGNOSTIC` |
| `READY` | runtime reset only |
| `DEGRADED` | runtime reset only |
| `SAFE_DIAGNOSTIC` | full retry or reload only |

Illegal transitions fail with:

```text
E_BOOT_STATE_TRANSITION
```

## 15.3 Product control gate

Product commands must check one central readiness predicate.

```ts
runtimeGate.requireProductReady();
```

Individual components must not implement their own partial readiness logic.

## 15.4 Boot reentry

A second bootstrap attempt in the same epoch fails with:

```text
E_BOOT_REENTRY
```

---

# 16. Deterministic Boot Receipt Seal

## 16.1 Two-layer record

Boot evidence consists of:

```text
Deterministic Seal
+
Volatile Telemetry Envelope
```

Only the deterministic seal is promotion evidence.

## 16.2 Deterministic seal payload

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-RUNTIME-SSOT-01-R1",
  "appId": "com.dadumdadum.app",
  "profile": "production",
  "promotable": true,
  "viteManifestDigest": "<sha256>",
  "runtimeManifestDigest": "<sha256>",
  "runtimePlanDigest": "<sha256>",
  "servicePlanDigest": "<sha256>",
  "packageLockDigest": "<sha256>",
  "capabilityFingerprint": {
    "webgpu": true,
    "webgl2": true,
    "wasm": true,
    "crossOriginIsolated": true,
    "nativeDecoderBridge": true
  },
  "moduleResults": [
    {
      "id": "dadum.module.gpu-v1",
      "version": "1.0.0",
      "status": "ACTIVE",
      "implementationId": "dadum.wgpu-runtime-v1",
      "stableErrorCode": null
    }
  ],
  "serviceResults": [
    {
      "id": "dadum.runtime.gpu",
      "status": "ACTIVE",
      "epoch": 1,
      "stableErrorCode": null
    }
  ],
  "capabilities": [
    {
      "id": "dadum.gpu.device",
      "ownerModuleId": "dadum.module.gpu-v1",
      "implementationId": "dadum.wgpu-runtime-v1"
    }
  ],
  "legacyModules": [],
  "terminalState": "READY",
  "bootSealSha256": "<sha256>"
}
```

## 16.3 Stable ordering

Before canonicalization:

- modules sort by phase, order, ID,
- services sort by service ID,
- capabilities sort by capability ID,
- legacy modules sort by declared order then ID,
- object keys sort lexicographically.

## 16.4 Volatile telemetry envelope

Telemetry may contain:

```json
{
  "attemptId": "uuid",
  "startedAt": "iso-time",
  "finishedAt": "iso-time",
  "durationMs": 1234,
  "userAgent": "...",
  "adapterInfo": "...",
  "rawErrors": []
}
```

Telemetry is excluded from `bootSealSha256`.

## 16.5 Capability fingerprint rule

Only normalized booleans and stable capability classes participate in the deterministic seal.

Raw GPU adapter names, driver strings, device labels, and timing values are telemetry only.

## 16.6 Receipt publication

The authoritative receipt is owned by Receipt Service.

Pinia stores only:

```text
receiptId
bootSealSha256
terminalState
```

A read-only diagnostic bridge may expose receipt export, but the receipt must not use mutable `window` state as SSOT.

## 16.7 Receipt persistence

Production boot receipts must be exportable as JSON.

Automatic disk persistence is optional and outside R1 unless implemented through the typed preload host API.

## 16.8 Determinism test

The same production build and fixed capability fixture must boot at least 100 times with:

```text
viteManifestDigest parity = 100 / 100
runtimePlanDigest parity = 100 / 100
servicePlanDigest parity = 100 / 100
bootSealSha256 parity = 100 / 100
```

---

# 17. Stable Error Codes

| Code | Meaning | Product state |
|---|---|---|
| `E_BOOT_REENTRY` | Bootstrap attempted twice in one epoch | `SAFE_DIAGNOSTIC` |
| `E_BOOT_STATE_TRANSITION` | Illegal boot transition | `SAFE_DIAGNOSTIC` |
| `E_VITE_BUILD_MANIFEST_MISSING` | Generated Vite manifest unavailable | `SAFE_DIAGNOSTIC` |
| `E_VITE_BUILD_MANIFEST_DIGEST` | Vite manifest digest mismatch | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_MANIFEST_MISSING` | Dadum runtime manifest unavailable | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_MANIFEST_SCHEMA` | Runtime manifest schema invalid | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_MANIFEST_DIGEST` | Runtime manifest self-digest mismatch | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_MODULE_DUPLICATE_ID` | Duplicate logical module ID | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_DEPENDENCY_MISSING` | Required dependency not admitted | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_DEPENDENCY_CYCLE` | Runtime dependency cycle | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_CAPABILITY_COLLISION` | More than one active owner for capability | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_SERVICE_COLLISION` | More than one owner for service | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_REQUIRED_MODULE_FAILED` | Required logical module activation failed | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_REQUIRED_SERVICE_FAILED` | Required service initialization failed | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_PLACEHOLDER_AUTHORITY` | Stub or placeholder attempted capability publication | `SAFE_DIAGNOSTIC` |
| `E_RUNTIME_STALE_RESOURCE_EPOCH` | Resource ID belongs to stale epoch | command rejected |
| `E_RUNTIME_RESOURCE_OWNER_MISMATCH` | Service accessed another owner's private resource | command rejected or diagnostic |
| `E_PINIA_NON_SERIALIZABLE_STATE` | Forbidden live object found in store | `SAFE_DIAGNOSTIC` in production |
| `E_PINIA_DIRECT_RUNTIME_OBJECT` | Runtime object inserted into store | `SAFE_DIAGNOSTIC` in production |
| `E_LEGACY_UNDECLARED_SCRIPT` | Legacy script not in generated legacy manifest | `SAFE_DIAGNOSTIC` |
| `E_LEGACY_GLOBAL_WRITE` | Unexpected global write detected | `SAFE_DIAGNOSTIC` |
| `E_LEGACY_SCRIPT_INJECTION` | Legacy script attempted nested injection | `SAFE_DIAGNOSTIC` |
| `E_HOST_BRIDGE_UNAVAILABLE` | Required preload API missing | `SAFE_DIAGNOSTIC` |
| `E_HOST_BRIDGE_PROTOCOL` | Preload API protocol mismatch | `SAFE_DIAGNOSTIC` |
| `E_GPU_DEVICE_LOST` | Active WebGPU device lost | runtime reset required |
| `E_WORKER_PROTOCOL_MISMATCH` | Worker message contract mismatch | module failure |
| `E_EXPORT_FINAL_SURFACE_MISSING` | No authoritative final export surface | export failed |
| `E_EXPORT_STALE_SURFACE_REVISION` | Export surface revision not current | export failed |
| `E_CODEC_SEMANTIC_FALLBACK` | Requested codec replaced by different codec | export failed |
| `E_BOOT_RECEIPT_NONDETERMINISTIC` | Fixed boot fixture produced different seal | promotion failed |

---

# 18. Validation Gates

## GATE-R1-01. Vite entry closure

PASS when:

```text
source index executable entries = 1
entry = /src/main.ts
production index executable entries = Vite-generated only
manual product script tags = 0
inline executable scripts = 0
```

## GATE-R1-02. Production source serving closure

PASS when packaged Electron serves `dist/renderer/` and no product request resolves from source `app/`.

## GATE-R1-03. Vite manifest closure

PASS when every emitted JavaScript chunk is reachable from the Vite manifest and no unlisted executable JavaScript exists in `dist/renderer/`.

## GATE-R1-04. Runtime logical module closure

PASS when every activated logical module appears exactly once in the generated Dadum Runtime Manifest.

## GATE-R1-05. Dependency DAG gate

PASS when runtime module dependencies are complete, acyclic, and phase-valid.

## GATE-R1-06. Capability ownership gate

PASS when every published capability has one active owner and all consumers resolve to that owner.

## GATE-R1-07. Service ownership gate

PASS when every required Runtime Service has one owner and no service ID collision exists.

## GATE-R1-08. Pinia serializability static gate

Static analysis must reject imports or type annotations for forbidden runtime types inside `stores/`.

## GATE-R1-09. Pinia serializability runtime gate

Every store snapshot must pass canonicalization after:

- initial boot,
- file selection,
- decode success,
- processing start,
- processing success,
- preview presentation,
- export success,
- safe diagnostic failure.

## GATE-R1-10. Vue DOM ownership gate

Outside approved adapter files, static search must find no product wiring through global document selectors.

## GATE-R1-11. Legacy script admission gate

PASS when:

```text
legacy scripts loaded = generated legacy manifest entries only
unexpected global writes = 0
nested script injections = 0
legacy entries without retirement patch = 0
```

## GATE-R1-12. Required failure gate

Inject one failure into each required module and service.

Every case must produce:

```text
terminalState = SAFE_DIAGNOSTIC
product command gate = closed
receipt stableErrorCode = expected
```

## GATE-R1-13. Optional degradation gate

Inject an optional capability failure.

PASS when its controls are disabled, receipt records the failure, and no alternate implementation is silently adopted.

## GATE-R1-14. Placeholder rejection gate

Attempt to publish a placeholder object as a required capability.

Expected:

```text
E_RUNTIME_PLACEHOLDER_AUTHORITY
```

## GATE-R1-15. Resource isolation gate

Attempt to insert a GPU texture, Worker, Blob, or Canvas into Pinia.

Expected:

```text
E_PINIA_NON_SERIALIZABLE_STATE
```

## GATE-R1-16. Runtime epoch gate

After device reset, attempt to use a previous surface ID.

Expected:

```text
E_RUNTIME_STALE_RESOURCE_EPOCH
```

## GATE-R1-17. Export authority gate

Remove the authoritative final surface while leaving the source surface available.

Export must fail with:

```text
E_EXPORT_FINAL_SURFACE_MISSING
```

Source fallback must not occur.

## GATE-R1-18. Codec semantic gate

Request JXL with JXL encoder unavailable.

The output must not be PNG, WebP, or JPEG under a JXL label.

Expected:

```text
E_CODEC_SEMANTIC_FALLBACK
```

or an encoder-unavailable code mapped to a failed export receipt.

## GATE-R1-19. HMR contamination gate

In development, invalidate a runtime module owning live resources.

PASS only when the module disposes all resources or forces a full reload.

## GATE-R1-20. Deterministic receipt gate

Run the fixed production fixture 100 times.

All deterministic digests must match.

## GATE-R1-21. Production build reproducibility gate

Build twice from the same clean source tree, lockfile, Node version, and environment.

The following must match:

```text
runtimeManifestDigest
runtimePlanDigest
packageLockDigest
```

Vite chunk filenames and manifest digest must also match unless a documented toolchain nondeterminism is found and eliminated before promotion.

## GATE-R1-22. Safe Diagnostic accessibility gate

PASS when:

- diagnostic heading receives focus,
- error code is text-visible,
- receipt export works with keyboard only,
- product controls cannot be reached as enabled controls,
- retry uses full runtime reset.

---

# 19. Test Matrix

| Test ID | Scenario | Expected result |
|---|---|---|
| `R1-T01` | Clean production boot | `READY`, promotable receipt |
| `R1-T02` | Clean development boot | `READY`, `promotable=false` |
| `R1-T03` | Missing Vite manifest | `SAFE_DIAGNOSTIC` |
| `R1-T04` | Corrupt runtime manifest digest | `SAFE_DIAGNOSTIC` |
| `R1-T05` | Duplicate runtime module ID | `SAFE_DIAGNOSTIC` |
| `R1-T06` | Capability collision | `SAFE_DIAGNOSTIC` |
| `R1-T07` | Service collision | `SAFE_DIAGNOSTIC` |
| `R1-T08` | Required GPU service failure | `SAFE_DIAGNOSTIC` |
| `R1-T09` | Optional nonessential codec failure | `DEGRADED`, control disabled |
| `R1-T10` | Placeholder pipeline publication | rejected |
| `R1-T11` | GPUTexture inserted into Pinia | rejected |
| `R1-T12` | Worker inserted into Pinia | rejected |
| `R1-T13` | File selected | metadata stored, File not retained |
| `R1-T14` | Decode success | surface ID stored, decoded bytes not retained |
| `R1-T15` | Pipeline success | final surface revision bound |
| `R1-T16` | Export with stale revision | export fails |
| `R1-T17` | Export without final surface | no source fallback |
| `R1-T18` | JXL unavailable | no PNG masquerade |
| `R1-T19` | Legacy declared global write | accepted and audited |
| `R1-T20` | Legacy undeclared global write | boot fails |
| `R1-T21` | Legacy nested script injection | boot fails |
| `R1-T22` | Device loss | epoch increments, stale IDs rejected |
| `R1-T23` | Worker protocol mismatch | stable module failure |
| `R1-T24` | Full runtime reset | all resources disposed |
| `R1-T25` | 100 fixed boots | identical seal digest |
| `R1-T26` | Two clean production builds | identical deterministic manifests |
| `R1-T27` | Keyboard-only safe diagnostic | all diagnostic actions usable |
| `R1-T28` | Manual script added to index | static gate fails |
| `R1-T29` | Executable JS added to public asset path | build gate fails |
| `R1-T30` | Renderer requests `/app/...` alias | path gate fails |

---

# 20. Migration Sequence

R1 must not attempt a single uncontrolled rewrite.

The migration is divided into sealed stages.

## Stage R1-A. Toolchain and empty shell

Add:

- Vite,
- Vue 3,
- Pinia,
- TypeScript,
- one `main.ts`,
- one `App.vue`,
- production renderer output.

No legacy engine authority changes yet.

PASS requires one Vite entry and production build serving.

## Stage R1-B. Boot state and receipt core

Port:

- stable errors,
- canonical JSON,
- boot state machine,
- deterministic receipt logic,
- safe diagnostic view.

PASS requires fail-closed boot before workspace activation.

## Stage R1-C. Pinia ownership skeleton

Create serializable stores and state projection path.

Do not place engine objects into stores.

PASS requires serializability gates.

## Stage R1-D. Runtime Service Container

Create service ownership for:

- host bridge,
- diagnostics,
- resources,
- GPU,
- Workers,
- decoders,
- encoders,
- pipeline,
- preview,
- export.

Services may initially wrap existing implementations.

PASS requires unique ownership and disposal.

## Stage R1-E. Controlled Legacy Adapter

Move remaining classic scripts behind one generated legacy manifest and loader.

Measure and declare global writes.

PASS requires zero undeclared global writes.

## Stage R1-F. Vue shell migration

Replace current HTML control regions with Vue components or explicit Legacy DOM Islands.

PASS requires no global DOM wiring outside approved adapters.

## Stage R1-G. Product capability adoption

Adopt existing GPU, decoder, encoder, preview, and export implementations through Runtime Service identities.

No implementation becomes authoritative because its legacy global exists.

## Stage R1-H. Remove source serving and path aliases

Production Electron serves only `dist/renderer/`.

Remove `/app/` path rewrite dependency.

## Stage R1-I. Deterministic promotion

Run full gates, fixed boot repetitions, clean build repetition, and receipt sealing.

Only this stage may emit the final PASS marker.

---

# 21. Required File Mutations

Minimum expected mutations:

```text
package.json
package-lock.json
vite.config.ts
tsconfig.json
tsconfig.node.json
electron.mjs
preload.cjs
app/index.html
app/src/main.ts
app/src/App.vue
app/src/boot/*
app/src/stores/*
app/src/runtime/*
app/src/application/*
app/src/views/*
tools/generate-runtime-manifest.mjs
tools/verify-index-entry.mjs
tools/verify-pinia-serializable.mjs
tools/verify-runtime-ownership.mjs
tools/verify-boot-determinism.mjs
```

## 21.1 Existing source relocation

Existing code may be:

- directly converted to ESM and imported,
- wrapped by a Runtime Service,
- temporarily placed behind Legacy Runtime Adapter,
- classified as reference, experimental, deprecated, or broken.

It must not remain independently executable through `index.html`.

## 21.2 No generated patch injector

The bake must not rely on Python or Node scripts that modify `index.html` at runtime or package startup.

Build-time generation of manifests is allowed.

---

# 22. Promotion Criteria

The patch is promotable only when all criteria below pass.

## 22.1 Entry criteria

```text
source index executable root = 1
manual external script tags = 0
inline executable scripts = 0
production renderer source root = dist/renderer
```

## 22.2 State criteria

```text
Pinia forbidden live objects = 0
store canonicalization failures = 0
store ownership collisions = 0
```

## 22.3 Runtime criteria

```text
required Runtime Service initialization failures = 0
capability ownership collisions = 0
service ownership collisions = 0
placeholder capabilities = 0
stale resource acceptance = 0
```

## 22.4 Legacy criteria

```text
undeclared legacy scripts = 0
undeclared global writes = 0
legacy nested injection = 0
legacy entries without retirement patch = 0
```

Legacy module count may be greater than zero for R1 promotion, but each entry must be fully measured and receipt-bound.

## 22.5 Export criteria

```text
source fallback on missing final surface = 0
codec semantic fallback = 0
stale surface export = 0
```

## 22.6 Receipt criteria

```text
production receipt promotable = true
100-run boot seal parity = 100 / 100
clean-build runtime manifest parity = 2 / 2
volatile telemetry excluded from seal = verified
```

## 22.7 UI criteria

```text
workspace inaccessible before READY = true
safe diagnostic keyboard usable = true
Vue owns non-legacy product DOM = true
```

---

# 23. Rollback Contract

A rollback must restore one complete previous runtime authority.

Forbidden rollback:

```text
Vite entry remains
+ old index script stack partially restored
+ Pinia stores remain
+ globals regain product authority
```

Allowed rollback:

```text
restore baseline package and Electron serving path
restore baseline app/index.html
remove Vite renderer output authority
remove R1 Runtime Service and Pinia activation
restore one complete prior artifact
```

Rollback receipt must include:

- failed gate ID,
- stable failure code,
- candidate build digest,
- restored baseline digest,
- rollback timestamp in telemetry only.

---

# 24. Explicit Non-Goals

R1 does not require:

- rewriting all WGSL,
- replacing all WebGL paths,
- implementing the Working Color Contract,
- implementing local tensor-driven EWA,
- completing ICC conversion,
- completing JXL FP16 export,
- redesigning the entire visual interface,
- removing every legacy script in one patch,
- persisting all Pinia stores,
- introducing a router when a state-switched shell is sufficient.

R1 only creates the authority boundaries required to make those later changes testable.

---

# 25. Follow-on Patch Boundaries

After R1 promotion, the recommended sequence is:

```text
TDT-RUNTIME-SSOT-01-R2
Legacy Global Retirement / ESM Capability Adoption / Zero Classic Script Authority Seal

TDT-COLOR-01
Encoded Source / Linear Working Surface / Transfer Ownership Truth Seal

TDT-EXPORT-01
Final Surface Revision / GPU Capture Priority / No Source Downgrade Seal

TDT-CODEC-01
Encoder Identity / MIME Signature / No Semantic Fallback Seal
```

R1 must not quietly absorb these later patches.

---

# 26. Final PASS Marker

The bake may emit the following marker only after every promotion criterion and required gate passes:

```text
PASS_TDT_RUNTIME_SSOT_01_R1_VITE_AUTHORITATIVE_ENTRY_VUE_APPLICATION_SHELL_PINIA_SERIALIZABLE_STATE_OWNERSHIP_RUNTIME_SERVICE_ISOLATION_DETERMINISTIC_BOOT_RECEIPT_SEAL
```

A marker printed without attached build, runtime, service, and receipt artifacts is invalid.

---

# 27. Required Promotion Artifacts

```text
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_BUILD_MANIFEST.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_RUNTIME_MANIFEST.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_SERVICE_OWNERSHIP.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_LEGACY_ADMISSION.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_PINIA_SERIALIZABILITY.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_BOOT_RECEIPT.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_BOOT_TELEMETRY.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_GATE_REPORT.md
artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_LOCAL_MANIFEST.json
```

The local manifest must contain SHA-256 digests for every artifact and every mutated authoritative source file.

---

# 28. Final Seal Statement

R1 is complete only when the following statement is no longer architectural intent but executable truth:

> Vite decides which renderer code exists, Vue decides which UI exists, Pinia decides which serializable application state exists, Runtime Services decide which live engine resources exist, the generated Runtime Manifest decides which implementations are authoritative, and the Deterministic Boot Receipt proves that those decisions converged into one valid DadumDadum runtime.
