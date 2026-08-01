# TDT-GPU-DEVICE-SSOT-01 Applied

## Seal identity

- Patch ID: `TDT-GPU-DEVICE-SSOT-01`
- Title: `Single Adapter·Device Authority / Device Epoch / Device Loss Recovery / Pipeline Cache Ownership / Legacy GPU Runtime Retirement Seal`
- Baked state: `GPU_DEVICE_SSOT_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- Promotion ceiling: source closure plus isolated execution of the actual Authority class
- Production pointer mutation: forbidden and observed as `false`
- Packaged Electron claim: `false`

## What this bake changes

1. Replaces the previous compatibility `GpuService` implementation with `GpuDeviceAuthorityService` as the sole renderer-realm adapter and device authority.
2. Moves GPU Authority activation ahead of Legacy Runtime evaluation, so admitted legacy GPU consumers cannot create a device before the frozen authority bridge exists.
3. Introduces immutable GPU authority and consumer manifests for device profile, recovery bounds, cache policy, realm policy, and admitted owner IDs.
4. Replaces all admitted direct `requestAdapter()` and `requestDevice()` calls with authority leases.
5. Removes raw global adapter and device aliases and does not expose a raw service-level `device` getter.
6. Moves admitted shader module and compute/render pipeline creation behind the canonical authority cache bridge.
7. Binds leases, shader keys, and pipeline keys to `runtimeEpoch`, `deviceEpoch`, and device identity.
8. Adds stale lease rejection, released lease rejection, owner admission checks, one-attempt-per-runtime-epoch recovery, participant invalidation, and cross-epoch cache eviction.
9. Replaces immediate reload-on-loss behavior with recovery-first handling and reload only after a canonical recovery failure event.
10. Retires independent Worker-realm WebGPU creation from the admitted product graph. Worker GPU paths fail closed with `E_GPU_WORKER_REALM_NOT_ADMITTED`.
11. Adds source scans, boot-order verification, an isolated contract model, and a transpiled execution smoke of the actual Authority class with a controlled mock WebGPU device loss.
12. Preserves the existing resampling equations, color policy, encoder ABI, final-surface contract, and production pointer.

## Canonical authority surface

```text
GpuDeviceAuthorityService
├─ one selected adapter per runtime epoch
├─ one active renderer GPUDevice
├─ runtimeEpoch
├─ deviceEpoch
├─ deviceIdentity
├─ admitted lease registry
├─ shader module cache
├─ compute/render pipeline cache
├─ recovery participant registry
├─ bounded loss recovery
└─ source and runtime evidence
```

Legacy consumers receive only a frozen bridge with admitted operations. The bridge does not contain raw `adapter` or `device` properties.

## Source and isolated-runtime results

```text
TDT-GPU-DEVICE-SSOT-01
30 PASS / 30 DEFERRED / 0 FAIL

Direct GPU authority scan
798 files scanned / 0 findings

Pipeline ownership scan
798 files scanned / 0 findings

Changed files sealed
80
```

The actual TypeScript Authority class was transpiled and executed against a deterministic mock WebGPU adapter/device. That smoke observed:

```text
runtimeEpoch                    11
initial deviceEpoch              1
recovered deviceEpoch            2
adapter requests                 1
device requests                  2
same-epoch shader dedup        PASS
same-epoch pipeline dedup      PASS
cross-epoch shader reuse      false
cross-epoch pipeline reuse    false
old lease stale rejection      PASS
loss event                     PASS
recovery event                 PASS
bridge frozen                  PASS
bridge removed on dispose      PASS
```

This is an isolated execution of the real Authority class. It is not a claim that Windows, Electron, the RTX 3080 driver, or packaged WebGPU recovery has been observed.

## Conserved regression seals

The following source gates were rerun after the GPU ownership migration:

- Runtime R7 exact API, encoder identity, final surface and receipt gate: PASS
- Export Worker 01 through 07: PASS
- Export Promotion 01 through 03: PASS
- Build Lock and Build Emit source gates: PASS
- MODJPEG source gate: PASS
- Native Decoder source gate: PASS
- JXL Codec gate: `108 / 108 PASS`
- PSD Decoder gate: `112 / 112 PASS`
- Promotion Baseline source gate: `66 / 66 PASS`
- Active Graph source gate: `30 PASS / 10 DEFERRED / 0 FAIL`
- Active Graph regression: `19 / 19 PASS`
- TypeScript syntax: `85 files PASS`

## Deferred truth

The remaining `30 DEFERRED` gates require an actual renderer or packaged Electron observation. This bake does not fabricate the following evidence:

- real cold-boot adapter and device observation count
- concurrent lease behavior on the physical GPU
- real pipeline compilation counts and driver behavior
- controlled `GPUDevice.destroy()` recovery in packaged Electron
- Q-map dispatch after physical device recovery
- three independent recovery process runs
- Electron relaunch cleanup
- packaged artifact admission and digest relation
- pre-migration versus post-migration final-surface conservation
- packaged encoder, color-profile, bit-depth, and alpha receipt conservation

## Canonical verification

Source closure:

```powershell
npm run verify:gpu-device-ssot-01
```

This command regenerates the consumer receipt, scans direct adapter/device ownership, scans shader and pipeline ownership, verifies boot ordering and source contracts, executes both contract smokes, writes the gate receipt, and seals all changed files.

The packaged-runtime gates remain blocked until `TDT-PROMOTION-BASELINE-00` produces a real `PACKAGED_BASELINE_VERIFIED` receipt on the canonical Windows x64 environment.

## Source receipt

- State: `GPU_DEVICE_SSOT_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- Source seal SHA-256: `3843bc1997b503b41e928dbcb9ffc2442bb03de55e45cec5bc4c8d0722ccf846`
- Production pointer mutated: `false`
- Packaged claims: `false`
