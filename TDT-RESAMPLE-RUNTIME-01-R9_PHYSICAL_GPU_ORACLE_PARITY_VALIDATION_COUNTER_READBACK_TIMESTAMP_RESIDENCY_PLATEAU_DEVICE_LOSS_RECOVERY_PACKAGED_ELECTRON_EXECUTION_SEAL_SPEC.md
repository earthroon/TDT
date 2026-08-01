# TDT-RESAMPLE-RUNTIME-01-R9

## Physical GPU Oracle·Parity / Validation Counter Readback / Timestamp·Residency Plateau / Device-Loss Recovery / Packaged Electron Execution Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R9`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R8`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R8_UNCLIPPED_SUPPORT_ALPHA_BORDER_DC_CONSERVATION_ZERO_SILENT_DEGRADATION_BAKED_AWAITING_PHYSICAL_GPU.zip`
- **Parent repository bundle SHA-256:** `2315de3f92be90d5f2882db367d1d2dfb790982f8a2d07e91722db60289f9f05`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R8_CONSERVATION_AND_ZERO_DEGRADATION_SEALED_AWAITING_R9`
- **R9 source-harness state:** `RESAMPLE_RUNTIME_R9_PHYSICAL_HARNESS_SOURCE_BAKED_AWAITING_WINDOWS_EXECUTION`
- **R9 final physical state:** `RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10`
- **Rejected state:** `RESAMPLE_RUNTIME_R9_PHYSICAL_CANDIDATE_REJECTED`
- **Primary runtime:** packaged Electron / Windows x64 / hardware WebGPU
- **Primary graphics backend evidence:** D3D12 required
- **Software or fallback adapter:** forbidden
- **Timestamp feature:** `timestamp-query` required
- **Canonical kernel identity:** `tdt.ewa.ellipse.phase-correct-parametric-r6.v1`
- **Canonical ABI:** `tdt.delta-k-ewa.params.v4`, 96 bytes
- **Canonical lowpass surface:** linear premultiplied `rgba16float`
- **Physical harness identity:** `tdt.ewa.physical-harness.r9.v1`
- **Evidence schema identity:** `tdt.ewa.physical-evidence.r9.v1`
- **Binary16 comparator identity:** `tdt.ewa.binary16-ulp-comparator.r9.v1`
- **Timestamp methodology identity:** `tdt.ewa.paired-gpu-timestamp.r9.v1`
- **Residency ledger identity:** `tdt.ewa.residency-ledger.r9.v1`
- **Device-loss identity:** `tdt.ewa.device-loss-recovery.r9.v1`
- **Packaged execution identity:** `tdt.ewa.packaged-execution.r9.v1`
- **Production Pointer mutation:** forbidden
- **Final promotion authority:** none

---

# 0. Executive Contract

R9 shall convert the six physical gaps deliberately left by R8 into adapter-bound, package-bound, reproducible execution evidence. R9 is not allowed to infer hardware correctness from source inspection, mock execution, browser development mode, or an unpackaged module graph. It shall execute the frozen R8 canonical graph on a hardware WebGPU device from one frozen packaged Electron candidate and shall preserve every comparison result, validation counter, timestamp query, resource-ledger transition, device epoch, and package identity needed for independent replay.

R9 has two distinct acceptance layers:

```text
source-harness acceptance
    proves that the physical runner, schemas, fixtures, comparators,
    negative controls, package guard, and finalizer are complete
    but leaves every hardware result PENDING

physical acceptance
    executes the frozen package on the declared hardware adapter,
    resolves every physical gate to PASS or FAIL,
    and permits no PENDING, DEFERRED, SKIPPED, or ASSUMED result
```

A source-harness bake shall never emit the final physical state. A physical run shall never mutate product WGSL to make a failing fixture pass. Any product defect discovered by R9 shall reject the candidate and return to a new source patch authority.

The proof chain is:

```text
frozen R8 package bytes
    ↓
packaged Electron launch with source-tree isolation
    ↓
hardware adapter and device identity
    ↓
WGSL compilation and bind validation
    ↓
product ↔ direct-reference raw binary16 equality
    ↓
GPU ↔ independent binary64 oracle ULP comparison
    ↓
validation-counter readback
    ↓
DC, alpha, border, and residual identity evidence
    ↓
paired GPU timestamp evidence
    ↓
resource-ledger and process-memory plateau
    ↓
controlled device loss, epoch invalidation, reconstruction, parity replay
    ↓
Preview and Export execution from the same package candidate
    ↓
immutable physical acceptance receipt
```

R9 shall prove that the R8 source contracts survive actual shader compilation, texture storage precision, workgroup execution, buffer copy layout, package emission, device loss, and repeated resource lifetime. It shall not move the Production Pointer. R10 remains the sole authority for production-candidate promotion and rollback.

# 1. Parent Truth and Frozen Evidence

The sole admitted parent is the R8 bundle and digest listed in the metadata. Before generating any R9 source or evidence, the harness shall verify the following parent assets:

| Parent asset | SHA-256 |
|---|---|
| `README_TDT_RESAMPLE_RUNTIME_01_R8_APPLIED.md` | `378fc13d2a9a06cfd91183809f7a75df27435e60cc31fd8d588098972487fe9a` |
| `specs/TDT-RESAMPLE-RUNTIME-01-R8_UNCLIPPED_SUPPORT_ALPHA_BORDER_DC_CONSERVATION_ZERO_SILENT_DEGRADATION_SEAL_SPEC.md` | `909cf58039e7924900b29e5ee67166761e9a2c8052e454e1640585b1f49ee4f7` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_contract_r8.mjs` | `fbc0db4663a1116bf64cbfd06150cbb5d8f03a3b63217dfe0de4c1e55b06cd21` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r8.mjs` | `9d492931ac6849b9d2e3d2fe7d1f14475589cd8da705b02c9c79134e06c0cb7d` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v3.mjs` | `2d4416d19684b68308e711e7a133c50477c487ef53bcb2ee45838976e5d9989f` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_support_envelope_r8.mjs` | `8f890d38084d92bc2ef8044fb505b418be31d955bc87efd2f58bd63e34c31db5` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_source_prepare_runtime_r8.mjs` | `ef4ecabf4fae11232840a9976a9e997413efd6e869c996436b7208314d35b870` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r8.mjs` | `63407dcddbf736a8b44c58b3acf396cf67e3aa48979d7a1ca24f1ce7dbe751a1` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_source_prepare_r8.wgsl` | `9980a95892426d47ce01d10d071693606d024e7a711ab6635d529c7e8496e0d9` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r8.wgsl` | `b14038f8e987b2c97e38ce289348cc003d3d2820fcecfdbdfbf5955fcaa44a25` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r8.wgsl` | `caead67b6e188e2a4ca98b9f6f44ad875500288dbd049cdac62fcbebddaca4df` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v6_r8.wgsl` | `ffc0633c29429230e244d0a1fbb4135053e386c95f28ad8e625eafd098692ec7` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r8.wgsl` | `848582c747543db92514fb5b73ee3b667cdc45efeef7aa7f32d2516471df0fc3` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r8.wgsl` | `792cb27c7adcb4cc6d54324c524f62eabe00e22bbcce45e337cd24217aa16d09` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r8.json` | `e1b57005fb27f5ac076551ecee9676411b7560d3f0b732fba27a37ebaa97d57e` |
| `app/legacy-runtime/modules/dk_resample/export_residual_runtime_r8.mjs` | `f90439271da4d8ac9ce975336c44488c0a0c12951436b48a626d357869f93d9b` |
| `app/legacy-runtime/modules/dk_resample/export_finalize_runtime_r8.mjs` | `f90dc15164ba4b186fde57676f51bc74eeea60640f39b1586e0d14a5e6237f81` |

A mismatch shall fail with `E_R9_PARENT_EVIDENCE_MISMATCH`. R9 may add physical-test-only validation shaders, comparison kernels, runners, schemas, fixtures, and package guards. It shall not alter the frozen R8 mathematical product, direct reference, planner v3, source preparation, residual ordering, finalization semantics, or historical receipts.

# 2. Scope and Non-Goals

R9 is responsible for physical WebGPU and packaged Electron execution truth. It is not responsible for changing the EWA weight function, expanding support beyond R6, redesigning the axial field, introducing a new alpha semantic, changing Export codecs, or promoting the Production Pointer.

R9 shall not claim:

- driver-vendor universality from one adapter;
- immunity to an operating-system or driver update not represented by the receipt;
- exact equivalence between binary64 arithmetic and GPU f32 internal arithmetic before binary16 storage;
- production promotion merely because the physical candidate passes;
- OS-level driver-reset recovery unless an actual reset is separately executed and identified.

The mandatory primary qualification profile is one packaged Windows x64 Electron candidate on a non-fallback hardware D3D12 adapter with `timestamp-query`. Additional adapters may generate observational receipts, but they cannot replace the primary profile.

# 3. State Machine

```text
R8_SOURCE_VERIFIED
  → R9_HARNESS_SOURCE_BAKED
  → R9_PACKAGE_CANDIDATE_FROZEN
  → R9_PHYSICAL_RUN_IN_PROGRESS
  → R9_PHYSICAL_EVIDENCE_COMPLETE
  → R9_PHYSICAL_ACCEPTED
```

Any schema failure, package mutation, adapter downgrade, comparison mismatch, nonzero admitted counter, invalid timing sample set, positive residency slope, or failed recovery moves the run to `RESAMPLE_RUNTIME_R9_PHYSICAL_CANDIDATE_REJECTED`. A rejected run cannot be resumed into an accepted run. A new run ID and clean evidence directory are required.

# 4. Qualification Profile and Environment Identity

The primary qualification profile shall include OS platform and architecture, packaged Electron/Chromium/Node versions, application build and package digests, adapter identity, Electron complete GPU diagnostics, fallback status, negotiated WebGPU features and limits, power-source metadata, and the canonical device epoch. D3D12 evidence must come from the packaged process diagnostics or equivalent package-bound GPU report. A user-supplied text label is insufficient.

The run shall reject SwiftShader, WARP, software rendering, a fallback adapter, `--disable-gpu`, forced software WebGPU, or any launch mode that changes the package's normal GPU backend. Display scale, HDR desktop mode, and monitor placement may be recorded, but canonical lowpass comparison operates on GPU textures and must not depend on presentation state.

# 5. Packaged Candidate Identity

The candidate shall be built from the frozen dependency lock and emitted source graph. `win-unpacked` produced by electron-builder is an admissible packaged candidate when its executable and resource tree are complete, package-content identity is generated, and the running process proves that no module or shader was loaded from the repository, a dev server, or a temporary source mirror.

The same package bytes shall execute compilation, parity, oracle, counters, timing, residency, device-loss, Preview, and Export tests. The package digest is frozen before the first physical dispatch and verified again after the final process exit. Evidence is written outside package resources.

# 6. Harness Architecture

The physical harness shall have one main-process guard, one isolated renderer entry, and a narrow typed IPC bridge. The bridge shall expose only run-manifest retrieval, evidence-root acquisition, atomic result submission, and controlled device-loss requests. It shall not expose arbitrary file reads, arbitrary command execution, or raw unrestricted IPC.

The harness is activated only by an R9 launch token bound to the run manifest digest. Ordinary application sessions cannot discover or invoke the physical runner. The harness must call the same canonical Preview and Export lowpass authorities used by the application. It may use test-only direct reference and instrumented validation pipelines, but those pipelines cannot replace the canonical product result.

# 7. Fixture Corpus

The corpus shall include small oracle fixtures no larger than 64×64, medium parity fixtures, large timing fixtures, and repeated lifecycle fixtures. It shall cover R4 and R6 profiles, integer and fractional scales, independent x/y phases, axial wrap boundaries, maximum admitted anisotropy, policy footprint scales 0.75/1.0/1.5, constant fields, impulses, checkerboards, lines at 0/22.5/45/67.5/90 degrees, borders, corners, 1×1, 1×N, N×1, partial workgroups, straight and premultiplied alpha, hidden RGB at alpha zero, residual on/off, and multistage plans.

Each fixture manifest entry shall state which comparisons apply. A large timing fixture may omit the binary64 oracle but may not omit product/reference parity or validation counters. A controlled-fault fixture may produce fault sentinels only when the expected counter identity and count are declared in advance.

# 8. Physical WGSL Compilation

Every packaged WGSL module shall be loaded by packaged URL, passed through shader-module compilation information, and used to create its pipeline under a WebGPU validation error scope. Compilation warnings are recorded. Error-severity messages, pipeline creation rejection, bind-layout mismatch, storage-format mismatch, insufficient workgroup storage, missing feature, or uncaptured error reject the candidate.

The compiled set includes source preparation, R4 product, R6 product, direct reference, R9 instrumented validation R4/R6, residual, finalization, and any comparison kernel. R9 validation shaders may split the overloaded R8 counter zero into separate out-of-tile and unsupported-field counters, but they shall preserve the product math and remain test-only.

# 9. Product and Direct-Reference Parity

The canonical product and direct reference shall receive identical input texture bytes, axial texture bytes, policy texture bytes, 96-byte parameter buffer, stage dimensions, and device epoch. Both results are stored to `rgba16float`, copied to buffers, stripped of row padding, and compared as raw 16-bit channel words.

The acceptance threshold is exact equality: mismatch word count equals zero. No epsilon, color-space conversion, unpremultiply, channel swizzle, signed-zero normalization, or NaN canonicalization is allowed in this comparison. Product/reference parity proves that tiled shared-memory access does not change the stored result relative to direct loads. It does not replace the independent oracle.

# 10. Independent Binary64 Oracle

The independent oracle shall reproduce source preparation, continuous source position, `floor(p)` base, logical-distance border semantics, coherence-weighted double-angle interpolation, ellipse axes, parametric weight, normalization, premultiplied alpha, and the declared terminal operation using binary64 host arithmetic. It shall not parse, execute, import, or translate product WGSL.

Expected values are rounded by an independent IEEE-754 binary16 encoder before ULP comparison. Unless a fixture declares a stricter exact rule, admitted lowpass channels shall be within one binary16 ULP of the rounded oracle. Product/reference equality remains exact. Both signed zero encodings are numerically equal for oracle ULP purposes but their counts are recorded. NaN and Infinity are forbidden in admitted output.

# 11. Validation Counter Readback

The validation buffer contains 32 little-endian `u32` counters. It is cleared, copied back, mapped, persisted, and unmapped for every validation dispatch. The receipt records the complete array, not only named indexes.

Admitted fixtures require all named fault counters and all reserved counters to be zero. Controlled fixtures shall increment exactly the declared counter while unrelated counters remain zero. A zero-filled or disconnected counter buffer must be detected by controlled-fault tests. Every fault-sentinel pixel must correspond to a counter event, and every admitted run must contain no fault sentinel.

# 12. DC, Alpha, Border, and Residual Conservation

Constant representable premultiplied fields shall be conserved within one binary16 ULP at interior, edge, corner, tiny-dimension, and multistage locations. Border comparison shall retain logical tap multiplicity even when multiple taps fetch the same clamped texel.

Alpha-zero output shall have zero RGB. Straight and premultiplied source semantics shall follow R8 GPU source preparation. Residual disabled shall preserve the lowpass boundary exactly. Residual enabled shall preserve lowpass alpha as raw binary16 words. Preview and Export lowpass surfaces shall match exactly before residual and finalization.

# 13. Timestamp Methodology

Performance evidence shall use WebGPU `timestamp-query` around isolated product and direct-reference dispatch regions. CPU wall-clock duration is not an admissible substitute. Each profile shall complete at least 128 warmup iterations and 256 valid paired measurements. Pair order shall be balanced AB/BA to reduce drift bias. Raw query ticks, normalized durations, order, fixture identity, and exclusion reason shall be preserved.

Correctness is a prerequisite for timing. The R4 tiled/reference median ratio shall be at most 0.80 and the R6 ratio at most 0.90. Product p95 shall not exceed reference p95. A run with query wrap, zero deltas, missing pairs, excessive exclusions, or thermal/clock drift beyond the declared validity band is rejected rather than averaged into a favorable result.

# 14. Residency Plateau

WebGPU does not expose a portable authoritative VRAM counter. R9 therefore separates authoritative logical residency from observational process memory. Every texture, buffer, query set, and cached GPU object created by the harness or canonical runtime is registered with estimated bytes, owner, device epoch, and disposal state. After at least 32 warmup and 256 measured Preview/Export cycles, live resource counts and logical bytes shall return to the same baseline after each cycle, with zero positive slope in the final 64 cycles.

Renderer and Electron GPU-process memory are observational but mandatory sanity gates. The final-window spread shall remain within the larger of 64 MiB or five percent of baseline, and robust slope shall remain below the declared noise threshold. Vendor VRAM telemetry may be attached but cannot override a failing logical ledger.

# 15. Device-Loss Recovery

The harness shall capture a complete baseline, induce controlled loss through the canonical device authority, and verify the authority state machine. Submission shall stop, pending jobs shall reject, the device epoch shall increment exactly once, stale leases and old pipelines shall fail, and old resources shall be disposed once. The authority shall recreate the device and all epoch-bound pipelines, neutral policy texture, bind groups, query resources, and canonical surfaces.

After recovery, the same fixture shall reproduce the pre-loss product/reference parity, oracle tolerance, zero validation counters, and residency baseline. The complete sequence shall pass three consecutive cycles, including loss during readback and loss during Export. Recovery may not select CPU resampling, a fallback adapter, or a parallel raw-device singleton. R9 does not claim a real OS driver reset unless separately identified.

# 16. Packaged Preview and Export Execution

The package shall execute one Preview request and one Export request with identical source, target size, and canonical EWA parameters. Their lowpass receipts shall contain the same planner v3 digest, kernel identity, ABI identity, coordinate convention, axial-field identity, profile sequence, and device epoch. Their residual-disabled `rgba16float` lowpass surfaces shall be raw-word exact.

Preview shall present the canonical texture without CPU reconstruction. Export shall perform no intermediate lowpass readback and exactly one terminal readback after optional residual and finalization. The retired Export-specific lowpass path, direct reference, and validation shader cannot appear as product authority in the active execution receipt.

# 17. Negative Controls

R9 shall physically execute or validate controlled variants representing historical failure classes: round-centered distance, clipped support, distance from clamped fetch coordinates, direct tangent interpolation, double premultiplication, residual alpha mutation, stuck-zero counters, CPU wall-clock timing substitution, deliberate resource leak, and stale-epoch reuse. Each negative control must fail the intended gate and must never be admitted into package runtime assets outside the harness test partition.

# 18. Evidence Artifact Set

The physical run shall emit at least:

```text
R9_RUN_MANIFEST.json
R9_ENVIRONMENT_RECEIPT.json
R9_PACKAGE_IDENTITY.json
R9_ADAPTER_DEVICE_RECEIPT.json
R9_WGSL_COMPILE_REPORT.json
R9_PRODUCT_REFERENCE_PARITY.json
R9_ORACLE_ULP_REPORT.json
R9_VALIDATION_COUNTER_REPORT.json
R9_CONSERVATION_REPORT.json
R9_TIMESTAMP_RAW.json
R9_TIMESTAMP_SUMMARY.json
R9_RESIDENCY_LEDGER.json
R9_RESIDENCY_SUMMARY.json
R9_DEVICE_LOSS_REPORT.json
R9_PACKAGED_PREVIEW_EXPORT_REPORT.json
R9_NEGATIVE_CONTROL_REPORT.json
R9_CHILD_DIGEST_MANIFEST.json
TDT_RESAMPLE_RUNTIME_01_R9_FINAL_RECEIPT.json
```

Large raw buffers may be stored as deterministic binary blobs referenced by digest. The final receipt shall not silently omit them or replace them with screenshots.

# 19. Failure and Cleanup

Any failure shall stop finalization, close mappings, resolve or cancel pending work, destroy test-owned resources once, and write a rejected receipt. A package crash or interruption leaves an explicit incomplete marker. The harness shall not delete failed evidence automatically. A retry requires a new run ID and clean package launch.

# 20. Production Boundary

R9 acceptance qualifies a physical candidate but does not make it production. Production Pointer mutation, user-visible fallback selection, rollout percentage, release-channel switch, and rollback drill are outside R9. Those actions belong to R10 and require the immutable R9 final receipt as input.

# 21. Stable Error Codes

| Code | Meaning |
|---|---|
| `E_R9_PARENT_EVIDENCE_MISMATCH` | Parent Evidence Mismatch |
| `E_R9_SOURCE_HARNESS_INCOMPLETE` | Source Harness Incomplete |
| `E_R9_PACKAGE_IDENTITY_MISMATCH` | Package Identity Mismatch |
| `E_R9_SOURCE_TREE_LOAD_DETECTED` | Source Tree Load Detected |
| `E_R9_SOFTWARE_ADAPTER` | Software Adapter |
| `E_R9_D3D12_EVIDENCE_MISSING` | D3D12 Evidence Missing |
| `E_R9_TIMESTAMP_QUERY_MISSING` | Timestamp Query Missing |
| `E_R9_WGSL_COMPILE` | Wgsl Compile |
| `E_R9_PIPELINE_CREATE` | Pipeline Create |
| `E_R9_BIND_LAYOUT` | Bind Layout |
| `E_R9_PRODUCT_REFERENCE_MISMATCH` | Product Reference Mismatch |
| `E_R9_ORACLE_ULP_EXCEEDED` | Oracle Ulp Exceeded |
| `E_R9_NONFINITE_OUTPUT` | Nonfinite Output |
| `E_R9_FAULT_SENTINEL_ADMITTED` | Fault Sentinel Admitted |
| `E_R9_VALIDATION_COUNTER_NONZERO` | Validation Counter Nonzero |
| `E_R9_VALIDATION_COUNTER_DISCONNECTED` | Validation Counter Disconnected |
| `E_R9_DC_CONSERVATION` | Dc Conservation |
| `E_R9_ALPHA_IDENTITY` | Alpha Identity |
| `E_R9_BORDER_CONSERVATION` | Border Conservation |
| `E_R9_PREVIEW_EXPORT_DIVERGENCE` | Preview Export Divergence |
| `E_R9_TIMESTAMP_INVALID` | Timestamp Invalid |
| `E_R9_PERFORMANCE_REGRESSION` | Performance Regression |
| `E_R9_RESIDENCY_GROWTH` | Residency Growth |
| `E_R9_RESOURCE_LEAK` | Resource Leak |
| `E_R9_DEVICE_LOSS_TIMEOUT` | Device Loss Timeout |
| `E_R9_STALE_EPOCH_REUSED` | Stale Epoch Reused |
| `E_R9_POST_RECOVERY_MISMATCH` | Post Recovery Mismatch |
| `E_R9_INTERMEDIATE_READBACK` | Intermediate Readback |
| `E_R9_PACKAGE_MUTATED` | Package Mutated |
| `E_R9_CHILD_EVIDENCE_MISSING` | Child Evidence Missing |
| `E_R9_PENDING_PHYSICAL_GATE` | Pending Physical Gate |
| `E_R9_PRODUCTION_POINTER_MUTATED` | Production Pointer Mutated |

# 22. Required Implementation Layout

```text
tools/resample-runtime-01-r9/
  schemas/
  fixtures/
  oracle/
  comparators/
  package/
  physical/
  negative-controls/
  generate-fixtures.mjs
  verify-parent.mjs
  verify-source.mjs
  build-package-candidate.mjs
  run-packaged-physical.mjs
  compare-parity.mjs
  compare-oracle.mjs
  verify-counters.mjs
  verify-timestamps.mjs
  verify-residency.mjs
  verify-device-loss.mjs
  verify-package-execution.mjs
  finalize-source.mjs
  finalize-physical.mjs
  run.mjs

app/electron/
  r9-physical-e2e-guard.mjs

app/renderer/physical-r9/
  index.html
  physical-runner.mjs
  physical-bridge.mjs

artifacts/resample-runtime-01-r9/
  source-bake/
  physical-runs/<run-id>/
```

The exact paths may follow repository conventions, but identity, role separation, source-tree isolation, and artifact coverage are normative.

# 23. Required Commands

```bash
npm run generate:resample-runtime-01-r9
npm run verify:resample-runtime-01-r9:parent
npm run verify:resample-runtime-01-r9:source
npm run build:resample-runtime-01-r9:package
npm run run:resample-runtime-01-r9:physical
npm run verify:resample-runtime-01-r9:physical
npm run finalize:resample-runtime-01-r9:source
npm run finalize:resample-runtime-01-r9:physical
npm run verify:resample-runtime-01-r9
```

`verify:resample-runtime-01-r9` may finish in source-harness state on a non-Windows or non-WebGPU environment only when all physical gates remain explicitly `PENDING`. It shall never report final R9 acceptance in that condition.

# 24. Gate Semantics

R9 defines **110 SOURCE_MANDATORY gates** and **187 PHYSICAL_MANDATORY gates**, for **297 total gates**.

- `SOURCE_MANDATORY`: must PASS before a package candidate may be executed.
- `PHYSICAL_MANDATORY`: may be PENDING in the source-harness receipt, but must PASS in the final physical receipt.
- `FAIL`: the requirement is false, ambiguous, satisfied by a forbidden path, or lacks immutable evidence.
- `PENDING`: permitted only for PHYSICAL_MANDATORY gates in source-harness state.
- `DEFERRED`, `SKIPPED`, `ASSUMED`, and `NOT_APPLICABLE`: forbidden in the final physical receipt.

# 25. SOURCE_MANDATORY Gates

## R9-S001 `PARENT_BUNDLE_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The admitted R8 parent ZIP digest equals the frozen bundle identity.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S001` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S002 `PARENT_SPEC_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The R8 specification digest equals the frozen parent evidence.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S002` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S003 `PARENT_README_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The R8 applied README digest equals the frozen parent evidence.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S003` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S004 `R8_KERNEL_IDENTITY_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The R8 canonical kernel identity remains tdt.ewa.ellipse.phase-correct-parametric-r6.v1.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S004` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S005 `R8_ABI_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The 96-byte tdt.delta-k-ewa.params.v4 ABI and all field offsets remain unchanged.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S005` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S006 `R8_COORDINATE_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The pixel-center-v2 continuous source lattice remains unchanged.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S006` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S007 `R8_AXIAL_FIELD_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The R5 double-angle axial sampling contract remains unchanged.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S007` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S008 `R8_SUPPORT_PLANNER_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Planner v3 and unclipped support-envelope semantics remain unchanged.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S008` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S009 `R8_ALPHA_SEMANTIC_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The canonical lowpass surface remains linear premultiplied rgba16float.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S009` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S010 `R8_BORDER_SEMANTIC_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Logical-distance clamp-extension border semantics remain unchanged.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S010` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S011 `R8_RESIDUAL_ORDER_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Export residual remains terminal and cannot feed another lowpass stage.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S011` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S012 `R8_GENERATED_SOURCE_DIGESTS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** All frozen R8 product, validation, reference, and manifest digests match.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S012` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S013 `PRODUCTION_POINTER_UNCHANGED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 source preparation and physical execution do not mutate the Production Pointer.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S013` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S014 `NO_R8_IN_PLACE_REWRITE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 does not rewrite R8 product WGSL or historical R8 receipts in place.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S014` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S015 `PREDECESSOR_STATE_EXACT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The predecessor state is exactly RESAMPLE_RUNTIME_R8_CONSERVATION_AND_ZERO_DEGRADATION_SEALED_AWAITING_R9.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S015` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S016 `HARNESS_IDENTITY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A single tdt.ewa.physical-harness.r9.v1 identity owns physical qualification.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S016` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S017 `EVIDENCE_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A versioned tdt.ewa.physical-evidence.r9.v1 schema validates every artifact before finalization.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S017` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S018 `RUN_MANIFEST_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The run manifest fixes package, fixture, adapter, feature, limit, and threshold identities.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S018` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S019 `QUALIFICATION_PROFILE_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The qualification profile separates primary mandatory and observational adapter fields.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S019` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S020 `ADAPTER_IDENTITY_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Adapter vendor, architecture or device description, driver evidence, and fallback status are recorded.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S020` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S021 `DEVICE_IDENTITY_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Device epoch, required features, negotiated limits, and creation receipt are recorded.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S021` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S022 `PACKAGE_IDENTITY_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Executable, app.asar or resources tree, runtime manifest, and package-content digests are recorded.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S022` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S023 `FIXTURE_MANIFEST_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Every fixture has dimensions, source semantic, scale, policy, profile, and expected comparison roles.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S023` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S024 `SHADER_COMPILE_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Compilation information and pipeline creation results are recorded per shader and profile.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S024` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S025 `PARITY_RESULT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Product/reference raw-word equality and oracle ULP results use separate fields.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S025` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S026 `COUNTER_RESULT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Validation counter layout, reset proof, dispatch proof, and readback values are recorded.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S026` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S027 `TIMESTAMP_RESULT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Warmup, sample order, query ranges, raw ticks, normalized duration, and exclusions are recorded.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S027` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S028 `RESIDENCY_RESULT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Logical GPU ledger and process-memory observations are recorded separately.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S028` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S029 `DEVICE_LOSS_RESULT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Loss reason, epoch transition, pending-job closure, reconstruction, and post-recovery parity are recorded.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S029` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S030 `PACKAGE_EXECUTION_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Packaged launch identity, no-source-tree proof, Preview run, Export run, and exit status are recorded.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S030` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S031 `FINAL_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The final receipt references immutable child artifact digests rather than embedding unverifiable summaries.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S031` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S032 `ATOMIC_ARTIFACT_WRITE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** All evidence is written to temporary paths and atomically renamed after schema validation.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S032` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S033 `VOLATILE_FIELD_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Wall-clock fields are metadata only and excluded from deterministic content identity.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S033` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S034 `STABLE_ERROR_CODES`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Every fail-closed branch emits a stable R9 error code.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S034` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S035 `NO_BACKGROUND_UPLOAD`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The harness never uploads fixtures or evidence to a network service.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S035` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S036 `PHYSICAL_RUNNER_ENTRY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A dedicated packaged physical-runner entry exists and cannot execute in ordinary user sessions.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S036` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S037 `ELECTRON_MAIN_GUARD`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Electron main validates the digest-bound run manifest and output directory before exposing the harness.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S037` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S038 `RENDERER_HARNESS_ENTRY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A dedicated renderer harness invokes canonical Preview and Export authorities without UI automation shortcuts.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S038` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S039 `TEST_ONLY_BRIDGE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The test IPC bridge is allowlisted, typed, and unavailable without the R9 launch token.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S039` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S040 `NO_DEV_SERVER`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The packaged harness rejects localhost, Vite dev server, and source-tree module URLs.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S040` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S041 `NO_SOURCE_TREE_READ`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The packaged process proves that all runtime modules and WGSL assets came from packaged resources.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S041` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S042 `NO_REFERENCE_AS_PRODUCT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The direct reference pipeline cannot be selected as the product pipeline.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S042` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S043 `NO_CPU_RUNTIME_FALLBACK`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** CPU oracle code cannot be imported by Preview, Export, or canonical runtime modules.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S043` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S044 `ORACLE_TEST_ONLY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The binary64 oracle is reachable only from fixture-generation or evidence-comparison tools.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S044` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S045 `VALIDATION_SHADER_TEST_ONLY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Instrumented validation shaders are test-only and cannot replace canonical product dispatch.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S045` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S046 `NEGATIVE_CONTROL_TEST_ONLY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Negative-control shaders and mutated manifests are excluded from runtime asset admission.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S046` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S047 `NETWORK_DISABLED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The packaged run is valid with network disabled and records no network dependency.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S047` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S048 `ACTIVE_GRAPH_ADMISSION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Only the physical harness runtime assets are admitted; oracle and mutation tools remain quarantined.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S048` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S049 `PACKAGE_CONTENT_ADMISSION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** All R9 harness assets appear in the package-content manifest with exact digests.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S049` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S050 `SCRIPT_ENTRYPOINTS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Generate, verify-source, run-physical, compare, finalize, and verify-all scripts are defined.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S050` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S051 `WINDOWS_PATH_SAFETY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** All harness paths are canonicalized and remain below an explicit evidence root.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S051` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S052 `OUTPUT_OVERWRITE_GUARD`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** An existing completed run directory cannot be silently overwritten.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S052` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S053 `SINGLE_RUN_LOCK`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Only one physical qualification run may own the adapter and evidence directory at a time.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S053` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S054 `INTERRUPTION_MARKER`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Interrupted or crashed runs remain visibly incomplete and cannot be finalized.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S054` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S055 `CLEANUP_LEDGER`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Every R9-created texture, buffer, query set, pipeline wrapper, and readback mapping is registered.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S055` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S056 `FIXTURE_GENERATOR_DETERMINISTIC`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Fixture generation is byte-deterministic under the frozen manifest.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S056` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S057 `F64_ORACLE_REUSED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The R3/R5/R8 independent binary64 oracle is reused without importing product WGSL.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S057` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S058 `BINARY16_PACKER_INDEPENDENT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** An independent IEEE-754 binary16 packer and ULP ordering implementation exists.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S058` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S059 `RAW_TEXTURE_LAYOUT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** rgba16float texture-to-buffer row pitch and padding stripping are explicit and tested.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S059` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S060 `SIGNED_ZERO_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Product/reference exact comparison preserves sign bits; oracle numerical comparison treats both zero signs as equal and reports counts.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S060` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S061 `NAN_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Admitted fixtures permit no NaN or Infinity in product, reference, residual, or final lowpass surfaces.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S061` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S062 `FAULT_SENTINEL_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The R8 qNaN fault sentinel is recognized only as a fault and never accepted as ordinary output.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S062` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S063 `PRODUCT_REFERENCE_EXACT_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Product/reference canonical lowpass comparison is raw 16-bit word exact after texture storage.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S063` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S064 `ORACLE_ULP_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** GPU/oracle comparison rounds binary64 expectation to binary16 before ULP evaluation.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S064` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S065 `DC_ULP_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** DC conservation thresholds are defined independently from product/reference parity.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S065` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S066 `ALPHA_EXACT_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Residual-disabled lowpass alpha and residual alpha identity are raw-word exact.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S066` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S067 `BORDER_ULP_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Border conservation uses the same ULP limit as interior oracle comparison and records edge classes.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S067` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S068 `ROW_PADDING_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A comparator that includes copy-row padding is detected by a negative fixture.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S068` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S069 `CHANNEL_ORDER_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** RGBA/BGRA channel-order confusion is detected.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S069` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S070 `ENDIAN_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Incorrect binary16 byte order is detected.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S070` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S071 `ROUND_CENTER_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The historical round-centered sample-distance model fails fractional-phase fixtures.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S071` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S072 `CLIPPED_SUPPORT_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A validation-only radius-clipped kernel fails support and oracle evidence.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S072` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S073 `CLAMPED_DISTANCE_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Distance from clamped fetch coordinates fails border fixtures.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S073` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S074 `DIRECT_TANGENT_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Direct tangent interpolation fails axial wrap fixtures.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S074` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S075 `DOUBLE_PREMULT_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Double premultiplication fails alpha fixtures.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S075` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S076 `RESIDUAL_ALPHA_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A residual that mutates alpha is detected.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S076` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S077 `COUNTER_STUCK_ZERO_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A validation buffer forced to zero is detected by controlled-fault fixtures.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S077` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S078 `TIMESTAMP_FAKE_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** CPU wall-clock values cannot satisfy GPU timestamp gates.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S078` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S079 `RESIDENCY_LEDGER_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** An intentionally leaked test texture is detected by the ledger plateau gate.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S079` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S080 `STALE_EPOCH_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** A stale device-epoch resource is rejected after recovery.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S080` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S081 `PRIMARY_PLATFORM`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The primary qualification profile requires packaged Windows x64 Electron execution.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S081` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S082 `ELECTRON_VERSION_PIN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The source lock pins Electron and the physical runner contains a fail-closed package-version comparison.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S082` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S083 `CHROMIUM_VERSION_CAPTURE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The evidence schema and packaged runner require capture of the embedded Chromium version during physical execution.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S083` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S084 `NODE_VERSION_CAPTURE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The evidence schema and packaged runner require capture of the embedded Node version during physical execution.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S084` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S085 `D3D12_BACKEND_EVIDENCE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The primary-profile validator requires package-bound D3D12 evidence before physical acceptance.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S085` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S086 `SOFTWARE_ADAPTER_FORBIDDEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The adapter-profile validator rejects SwiftShader, WARP, software rasterization, and fallback adapters.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S086` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S087 `DISCRETE_ADAPTER_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The primary-profile schema requires a discrete adapter identity and prohibits an unspecified adapter.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S087` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S088 `TIMESTAMP_FEATURE_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The physical-run validator requires timestamp-query and cannot downgrade performance gates when it is absent.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S088` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S089 `REQUIRED_LIMITS_DECLARED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Required storage-texture, workgroup-storage, buffer-binding, and query limits are declared in the qualification profile.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S089` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S090 `FEATURE_LIMIT_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The device-profile schema defines a stable digest over negotiated features and limits.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S090` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S091 `POWER_STATE_CAPTURE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The timing schema requires power-source and thermal metadata without treating it as kernel truth.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S091` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S092 `DISPLAY_STATE_IRRELEVANT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The harness design keeps canonical texture evidence independent from display scale and monitor layout.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S092` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S093 `PACKAGE_BUILD_REPRODUCIBLE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The package build scripts define deterministic package-content manifests and a two-build comparison command.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S093` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S094 `PACKAGE_HASH_BEFORE_RUN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The package guard requires a candidate digest to be frozen before physical execution.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S094` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S095 `PACKAGE_HASH_AFTER_RUN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The package guard rehashes application bytes after physical execution and rejects mutation.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S095` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S096 `EVIDENCE_EXTERNAL_TO_PACKAGE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The harness constrains evidence output outside package resources.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S096` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S097 `SAME_PACKAGE_ALL_TESTS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The run-manifest schema binds compile, parity, timing, recovery, Preview, and Export to one package candidate digest.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S097` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S098 `SAME_DEVICE_PREVIEW_EXPORT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The run-manifest and receipt schemas require Preview and Export to share one device authority and epoch before induced loss.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S098` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S099 `NO_GPU_FLAG_DOWNGRADE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The package-launch guard rejects flags that disable GPU, force software rendering, or relax WebGPU validation.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S099` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S100 `UNPACKED_PACKAGE_QUALIFIES`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The qualification profile defines win-unpacked acceptance only after package-content identity and source-tree isolation pass.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S100` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S101 `R8_PREDECESSOR_REGRESSION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R1A through R8 source gates pass in isolated predecessor snapshots.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S101` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S102 `R9_SOURCE_SYNTAX`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** All added JS, MJS, JSON, WGSL templates, and schemas pass syntax or schema validation.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S102` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S103 `R9_SOURCE_GRAPH`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Active Graph and runtime asset manifests agree on every R9 runtime asset.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S103` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S104 `R9_SOURCE_DETERMINISM`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Generated fixtures, manifests, schemas, and source receipts are byte-deterministic.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S104` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S105 `R9_SOURCE_RECEIPT_COMPLETE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The source-bake receipt contains every SOURCE_MANDATORY result.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S105` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S106 `R9_SOURCE_STATE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The source-bake state is RESAMPLE_RUNTIME_R9_PHYSICAL_HARNESS_SOURCE_BAKED_AWAITING_WINDOWS_EXECUTION.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S106` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S107 `NO_PHYSICAL_PASS_FROM_SOURCE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Source evidence cannot mark any PHYSICAL_MANDATORY gate PASS.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S107` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S108 `NO_FINAL_STATE_WITH_PENDING`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** The final sealed state cannot be emitted while any physical gate is pending.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S108` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S109 `NO_PRODUCTION_PROMOTION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 final acceptance still does not move the Production Pointer.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S109` records status, evidence paths, observed identities or values, and a stable error code when applicable.

## R9-S110 `NEXT_AUTHORITY_DECLARED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10 is declared as the sole production-promotion and rollback authority.
- **PASS:** Deterministic source or package-preparation evidence satisfies the requirement without runtime fallback, package ambiguity, or Production Pointer mutation.
- **FAIL:** The requirement is false, missing, ambiguous, non-deterministic, or satisfied through a forbidden path.
- **Receipt:** `R9-S110` records status, evidence paths, observed identities or values, and a stable error code when applicable.

# 26. PHYSICAL_MANDATORY Gates

## R9-P001 `PACKAGE_LAUNCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The frozen packaged Electron candidate launches successfully under the R9 token.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P001` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P002 `PACKAGE_SOURCE_ISOLATION`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The running package proves no source-tree or dev-server module was loaded.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P002` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P003 `ADAPTER_ACQUIRED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** A non-fallback hardware adapter satisfying the primary profile is acquired.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P003` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P004 `ADAPTER_IDENTITY_COMPLETE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Adapter identity fields and Electron GPU diagnostics are complete.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P004` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P005 `DEVICE_CREATED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The device is created with required features and limits.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P005` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P006 `TIMESTAMP_QUERY_ENABLED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The created device exposes timestamp-query.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P006` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P007 `DEVICE_EPOCH_INITIAL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The initial device epoch and lease identity are recorded.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P007` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P008 `UNCAPTURED_ERROR_ZERO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No uncaptured WebGPU error occurs during the admitted run.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P008` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P009 `ERROR_SCOPE_BALANCED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Every pushed WebGPU error scope is popped and resolves without error.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P009` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P010 `R8_PRODUCT_R4_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged R8 R4 product WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P010` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P011 `R8_PRODUCT_R6_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged R8 R6 product WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P011` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P012 `R8_REFERENCE_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged direct reference WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P012` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P013 `R9_VALIDATION_R4_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The R9 instrumented R4 validation WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P013` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P014 `R9_VALIDATION_R6_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The R9 instrumented R6 validation WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P014` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P015 `SOURCE_PREPARE_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged R8 source-prepare WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P015` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P016 `RESIDUAL_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged R8 Export residual WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P016` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P017 `FINALIZE_COMPILES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged R8 Export finalization WGSL compiles and its pipeline is created.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P017` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P018 `COMPILATION_INFO_ZERO_ERROR`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Compilation info contains no error-severity message.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P018` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P019 `BIND_GROUP_LAYOUT_VALID`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** All product, reference, validation, source-prepare, residual, and finalization bind groups validate.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P019` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P020 `PIPELINE_CACHE_IDENTITY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Pipeline cache entries match shader digest, ABI, profile, device epoch, and role.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P020` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P021 `PARITY_R4_IMPULSE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for single-pixel impulse across fractional phases.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P021` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P022 `PARITY_R4_CHECKER`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for checkerboard and Nyquist stress.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P022` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P023 `PARITY_R4_LINE_H`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for horizontal edge and line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P023` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P024 `PARITY_R4_LINE_V`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for vertical edge and line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P024` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P025 `PARITY_R4_LINE_D22`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for 22.5-degree line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P025` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P026 `PARITY_R4_LINE_D45`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for 45-degree line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P026` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P027 `PARITY_R4_LINE_D67`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for 67.5-degree line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P027` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P028 `PARITY_R4_CONSTANT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for constant premultiplied RGBA.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P028` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P029 `PARITY_R4_ALPHA_EDGE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for straight and premultiplied alpha edge.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P029` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P030 `PARITY_R4_TRANSPARENT_RGB`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for alpha-zero hidden-RGB attack.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P030` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P031 `PARITY_R4_BORDER_CORNER`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for corner and duplicated-clamp-tap stress.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P031` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P032 `PARITY_R4_PARTIAL_GROUP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product and direct reference are raw-word exact for partial 8x8 workgroup dimensions.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P032` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P033 `PARITY_R6_IMPULSE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for single-pixel impulse across fractional phases.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P033` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P034 `PARITY_R6_CHECKER`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for checkerboard and Nyquist stress.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P034` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P035 `PARITY_R6_LINE_H`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for horizontal edge and line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P035` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P036 `PARITY_R6_LINE_V`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for vertical edge and line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P036` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P037 `PARITY_R6_LINE_D22`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for 22.5-degree line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P037` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P038 `PARITY_R6_LINE_D45`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for 45-degree line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P038` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P039 `PARITY_R6_LINE_D67`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for 67.5-degree line.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P039` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P040 `PARITY_R6_CONSTANT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for constant premultiplied RGBA.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P040` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P041 `PARITY_R6_ALPHA_EDGE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for straight and premultiplied alpha edge.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P041` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P042 `PARITY_R6_TRANSPARENT_RGB`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for alpha-zero hidden-RGB attack.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P042` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P043 `PARITY_R6_BORDER_CORNER`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for corner and duplicated-clamp-tap stress.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P043` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P044 `PARITY_R6_PARTIAL_GROUP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product and direct reference are raw-word exact for partial 8x8 workgroup dimensions.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P044` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P045 `ORACLE_ULP_PHASE_X`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for x-axis fractional phases 0 through 15/16.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P045` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P046 `ORACLE_ULP_PHASE_Y`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for y-axis fractional phases 0 through 15/16.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P046` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P047 `ORACLE_ULP_PHASE_XY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for independent two-axis fractional phases.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P047` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P048 `ORACLE_ULP_SCALE_1125`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for 1.125 source-per-destination scale.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P048` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P049 `ORACLE_ULP_SCALE_15`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for 1.5 source-per-destination scale.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P049` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P050 `ORACLE_ULP_SCALE_175`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for 1.75 source-per-destination scale.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P050` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P051 `ORACLE_ULP_SCALE_2`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for exact 2.0 source-per-destination scale.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P051` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P052 `ORACLE_ULP_ANISO_1`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for neutral anisotropy.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P052` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P053 `ORACLE_ULP_ANISO_MAX`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for maximum admitted anisotropy.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P053` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P054 `ORACLE_ULP_POLICY_075`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for policy footprint scale 0.75.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P054` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P055 `ORACLE_ULP_POLICY_1`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for policy footprint scale 1.0.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P055` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P056 `ORACLE_ULP_POLICY_15`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for policy footprint scale 1.5.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P056` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P057 `ORACLE_ULP_TINY_1X1`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for 1x1 source and destination.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P057` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P058 `ORACLE_ULP_TINY_1XN`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for one-pixel-wide source.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P058` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P059 `ORACLE_ULP_TINY_NX1`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for one-pixel-high source.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P059` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P060 `ORACLE_ULP_MULTISTAGE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Physical GPU output is within the declared binary16 ULP threshold of the independent binary64 oracle for multi-stage lowpass plan.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P060` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P061 `COUNTER_ZERO_0_OUT_OF_TILE_OR_UNSUPPORTED_FIELD`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 0 (OUT_OF_TILE_OR_UNSUPPORTED_FIELD) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P061` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P062 `COUNTER_ZERO_1_NONPOSITIVE_WEIGHT_SUM`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 1 (NONPOSITIVE_WEIGHT_SUM) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P062` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P063 `COUNTER_ZERO_2_NONFINITE_WEIGHT_SUM`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 2 (NONFINITE_WEIGHT_SUM) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P063` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P064 `COUNTER_ZERO_3_NONFINITE_ACCUMULATION`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 3 (NONFINITE_ACCUMULATION) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P064` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P065 `COUNTER_ZERO_5_NONFINITE_OUTPUT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 5 (NONFINITE_OUTPUT) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P065` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P066 `COUNTER_ZERO_16_ABI_MISMATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 16 (ABI_MISMATCH) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P066` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P067 `COUNTER_ZERO_17_PHASE_MISMATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 17 (PHASE_MISMATCH) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P067` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P068 `COUNTER_ZERO_18_BORDER_MISMATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 18 (BORDER_MISMATCH) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P068` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P069 `COUNTER_ZERO_19_KERNEL_PARAM_INVALID`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 19 (KERNEL_PARAM_INVALID) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P069` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P070 `COUNTER_ZERO_20_NONFINITE_DISTANCE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 20 (NONFINITE_DISTANCE) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P070` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P071 `COUNTER_ZERO_21_NONFINITE_WEIGHT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 21 (NONFINITE_WEIGHT) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P071` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P072 `COUNTER_ZERO_22_NEGATIVE_WEIGHT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 22 (NEGATIVE_WEIGHT) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P072` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P073 `COUNTER_ZERO_23_POSITIVE_WEIGHT_OUTSIDE_SUPPORT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 23 (POSITIVE_WEIGHT_OUTSIDE_SUPPORT) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P073` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P074 `COUNTER_ZERO_24_GENERATED_CONTRACT_MISMATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Validation counter index 24 (GENERATED_CONTRACT_MISMATCH) is exactly zero for all admitted fixtures.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P074` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P075 `COUNTER_POSITIVE_0_CONTROL_OUT_OF_TILE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 0 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P075` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P076 `COUNTER_POSITIVE_1_CONTROL_ZERO_MASS`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 1 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P076` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P077 `COUNTER_POSITIVE_16_CONTROL_ABI`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 16 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P077` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P078 `COUNTER_POSITIVE_17_CONTROL_PHASE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 17 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P078` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P079 `COUNTER_POSITIVE_18_CONTROL_BORDER`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 18 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P079` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P080 `COUNTER_POSITIVE_19_CONTROL_KERNEL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 19 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P080` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P081 `COUNTER_POSITIVE_20_CONTROL_NAN_DISTANCE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 20 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P081` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P082 `COUNTER_POSITIVE_24_CONTROL_SENTINEL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The controlled negative fixture increments validation counter index 24 and no unrelated counter.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P082` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P083 `COUNTER_BUFFER_RESET`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The 32-u32 validation buffer is cleared and verified before every measured dispatch.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P083` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P084 `COUNTER_READBACK_COMPLETE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** All 32 counter words are copied, mapped, persisted, and unmapped without omission.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P084` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P085 `COUNTER_RESERVED_ZERO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Every reserved validation counter remains zero in admitted and controlled runs unless explicitly assigned.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P085` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P086 `FAULT_SURFACE_COUNTER_COUPLING`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Every fault-sentinel output has a corresponding positive validation counter and vice versa.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P086` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P087 `DC_INTERIOR_ULP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Representable constant premultiplied fields are conserved within one binary16 ULP in interior pixels.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P087` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P088 `DC_EDGE_ULP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Representable constant premultiplied fields are conserved within one binary16 ULP on edges.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P088` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P089 `DC_CORNER_ULP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Representable constant premultiplied fields are conserved within one binary16 ULP at corners.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P089` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P090 `DC_TINY_DIMENSION_ULP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** DC conservation holds for 1x1, 1xN, and Nx1 dimensions.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P090` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P091 `ALPHA_ZERO_CANONICAL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Alpha-zero canonical lowpass pixels contain zero RGB and finite zero alpha.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P091` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P092 `ALPHA_STRAIGHT_ROUNDTRIP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Straight sRGB input to linear premultiplied lowpass to straight sRGB output satisfies the declared quantization threshold.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P092` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P093 `ALPHA_PREMULT_ROUNDTRIP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Premultiplied sRGB input follows encoded-unpremultiply, linear decode, and linear-premultiply semantics.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P093` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P094 `ALPHA_NO_DOUBLE_PREMULT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No admitted premultiplied input is premultiplied twice.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P094` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P095 `RESIDUAL_ALPHA_EXACT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Residual-on output alpha is raw-word exact to residual-off lowpass alpha.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P095` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P096 `RESIDUAL_DISABLED_IDENTITY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Residual disabled preserves the lowpass texture exactly before finalization.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P096` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P097 `BORDER_LOGICAL_DISTANCE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Border fixtures match the oracle that computes distance from logical coordinates.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P097` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P098 `BORDER_TAP_MULTIPLICITY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Repeated clamped fetches retain separate logical tap mass.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P098` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P099 `NO_FAULT_SENTINEL_ADMITTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No admitted fixture contains the R8 fault sentinel.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P099` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P100 `NO_NONFINITE_ADMITTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No admitted lowpass, residual, or finalization surface contains NaN or Infinity.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P100` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P101 `PREVIEW_EXPORT_LOWPASS_EXACT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Preview and Export canonical lowpass surfaces are raw-word exact for identical plans.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P101` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P102 `PLAN_DIGEST_EQUAL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Preview and Export produce the same planner v3 plan digest for identical inputs.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P102` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P103 `TIMESTAMP_WARMUP_R4`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 timing uses at least 128 unmeasured warmup iterations.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P103` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P104 `TIMESTAMP_WARMUP_R6`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 timing uses at least 128 unmeasured warmup iterations.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P104` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P105 `TIMESTAMP_SAMPLE_COUNT_R4`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 timing records at least 256 valid product/reference pairs.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P105` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P106 `TIMESTAMP_SAMPLE_COUNT_R6`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 timing records at least 256 valid product/reference pairs.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P106` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P107 `TIMESTAMP_PAIRED_ORDER`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Product/reference order alternates AB and BA or uses a deterministic balanced permutation.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P107` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P108 `TIMESTAMP_QUERY_ONLY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Kernel timing derives from GPU timestamp queries, not CPU wall-clock duration.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P108` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P109 `TIMESTAMP_DISJOINT_ZERO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No timing sample overlaps unrelated command work or readback.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P109` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P110 `TIMESTAMP_ZERO_DELTA_FORBIDDEN`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Zero or wrapped query deltas invalidate the timing run.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P110` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P111 `TIMESTAMP_OUTLIER_POLICY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Outlier exclusion is predeclared, bounded, and recorded per sample.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P111` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P112 `TIMESTAMP_THERMAL_VALID`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Thermal or clock drift stays within the declared validity band or the run is rejected.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P112` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P113 `R4_MEDIAN_RATIO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product median duration is at most 0.80 of direct reference median duration.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P113` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P114 `R6_MEDIAN_RATIO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product median duration is at most 0.90 of direct reference median duration.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P114` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P115 `R4_P95_RATIO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R4 tiled product p95 duration is no slower than direct reference p95.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P115` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P116 `R6_P95_RATIO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** R6 tiled product p95 duration is no slower than direct reference p95.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P116` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P117 `TIMING_CORRECTNESS_PRECONDITION`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No performance result is accepted unless the same fixture passed parity and counters.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P117` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P118 `TIMING_RAW_DATA_PERSISTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** All raw query results and pair ordering are persisted for independent recomputation.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P118` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P119 `RESIDENCY_WARMUP`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Residency testing completes at least 32 warmup Preview/Export cycles.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P119` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P120 `RESIDENCY_ITERATIONS`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Residency testing completes at least 256 measured cycles.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P120` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P121 `RESOURCE_COUNT_PLATEAU`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Live GPU resource counts return to the same baseline after every measured cycle.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P121` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P122 `RESOURCE_BYTE_PLATEAU`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The logical allocated-byte ledger has zero positive slope in the final 64 cycles.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P122` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P123 `PIPELINE_COUNT_PLATEAU`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Pipeline and bind-group cache cardinality stops growing after the declared warmup.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P123` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P124 `QUERY_RESOURCE_PLATEAU`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Query sets, resolve buffers, and readback buffers are disposed exactly once.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P124` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P125 `MAPPED_BUFFER_ZERO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No buffer remains mapped between iterations or at run completion.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P125` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P126 `SURFACE_REGISTRY_BASELINE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Surface Registry ownership returns to the declared baseline after each terminal release.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P126` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P127 `RENDERER_MEMORY_PLATEAU`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Renderer private-memory final-window spread stays within max(64 MiB, 5 percent of baseline).
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P127` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P128 `GPU_PROCESS_MEMORY_PLATEAU`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Electron GPU-process memory final-window spread stays within max(64 MiB, 5 percent of baseline).
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P128` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P129 `MEMORY_SLOPE_VALID`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Robust final-window memory slope is nonpositive or below the declared noise threshold.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P129` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P130 `VENDOR_VRAM_OBSERVATIONAL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Vendor VRAM telemetry, when available, is recorded as observational and never replaces the logical ledger.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P130` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P131 `LEAK_NEGATIVE_CONTROL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The deliberate texture leak makes the plateau gate fail.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P131` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P132 `RESIDENCY_FINAL_CLEAN`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** After harness shutdown, all R9-owned resource-ledger entries are zero.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P132` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P133 `LOSS_BASELINE_CAPTURE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** A complete parity and counter baseline is captured before induced device loss.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P133` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P134 `CONTROLLED_DEVICE_DESTROY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The harness induces controlled device loss through the canonical device authority.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P134` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P135 `LOSS_OBSERVER_SINGLE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Exactly one device-lost observer records the loss.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P135` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P136 `SUBMISSION_STOP_ON_LOSS`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** New submissions stop before invalidation begins.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P136` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P137 `PENDING_JOB_CLOSURE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** All pending R9 Preview, Export, parity, and readback jobs reject with stable loss errors.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P137` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P138 `EPOCH_INCREMENT_ONCE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Device epoch increments exactly once for each loss event.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P138` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P139 `STALE_LEASE_REJECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Every old device lease, pipeline, bind group, and surface is rejected after loss.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P139` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P140 `OLD_RESOURCE_DISPOSE_ONCE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Old-epoch resources are disposed exactly once without double-destroy accounting.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P140` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P141 `AUTHORITY_RECREATES_DEVICE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The canonical authority recreates adapter/device state without a parallel raw-device path.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P141` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P142 `PIPELINES_REBUILT_NEW_EPOCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Product, reference, validation, source-prepare, residual, and finalization pipelines are rebuilt for the new epoch.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P142` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P143 `NEUTRAL_POLICY_REINITIALIZED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The neutral policy texture is recreated and initialized with its R8 receipt.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P143` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P144 `POST_RECOVERY_PARITY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Post-recovery product/reference output is raw-word exact to the pre-loss baseline.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P144` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P145 `POST_RECOVERY_ORACLE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Post-recovery output satisfies the same oracle ULP thresholds.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P145` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P146 `POST_RECOVERY_COUNTERS`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Post-recovery admitted validation counters are all zero.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P146` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P147 `POST_RECOVERY_RESIDENCY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Post-recovery resource counts and bytes return to the same stable plateau.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P147` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P148 `THREE_LOSS_CYCLES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The complete controlled loss and recovery sequence passes three consecutive cycles.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P148` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P149 `LOSS_DURING_READBACK`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Loss during an outstanding readback closes mapping and rejects the job without hanging.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P149` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P150 `LOSS_DURING_EXPORT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Loss during Export closes the session without emitting a partial successful artifact.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P150` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P151 `LOSS_NO_CPU_FALLBACK`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Recovery never substitutes CPU resampling or software WebGPU.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P151` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P152 `LOSS_RECEIPT_COMPLETE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Every loss cycle records reason, epochs, closures, rebuild identities, and parity outcome.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P152` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P153 `PACKAGED_PREVIEW_EXECUTES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged Preview path produces the canonical R8 lowpass surface.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P153` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P154 `PACKAGED_EXPORT_EXECUTES`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged Export path produces canonical lowpass, optional residual, and finalization outputs.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P154` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P155 `PACKAGED_PREVIEW_EXPORT_SAME_KERNEL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Packaged Preview and Export receipts contain the same R8 kernel identity.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P155` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P156 `PACKAGED_PREVIEW_EXPORT_SAME_ABI`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Packaged Preview and Export receipts contain the same 96-byte ABI identity.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P156` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P157 `PACKAGED_PREVIEW_EXPORT_SAME_PLAN`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Packaged Preview and Export receipts contain the same planner v3 digest for identical requests.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P157` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P158 `PACKAGED_ASSET_DIGESTS`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Every loaded WGSL and runtime module digest matches the package-content manifest.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P158` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P159 `PACKAGED_NO_LEGACY_LOWPASS`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged active graph cannot execute the retired Export lowpass path.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P159` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P160 `PACKAGED_TERMINAL_READBACK`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Export performs no intermediate lowpass readback and exactly one terminal readback.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P160` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P161 `PACKAGED_PREVIEW_DIRECT_PRESENT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Preview presents the canonical GPU texture without CPU image reconstruction.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P161` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P162 `PACKAGED_RESIDUAL_OFF_IDENTITY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Packaged residual-off Export matches the canonical lowpass boundary exactly.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P162` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P163 `PACKAGED_RELAUNCH_IDENTITY`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Relaunching the same package reproduces adapter profile, asset digests, and fixture outputs.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P163` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P164 `PACKAGE_BYTES_UNCHANGED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Package bytes remain identical before and after all physical tests.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P164` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P165 `EXIT_CODE_ZERO`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The packaged harness exits zero only when every required child test passes.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P165` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P166 `EXIT_CODE_FAIL_CLOSED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Any child failure produces nonzero exit and an incomplete final receipt.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P166` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P167 `NO_USER_STATE_MUTATION`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical harness does not mutate user presets, recent files, caches, or Production Pointer.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P167` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P168 `NEGATIVE_ROUND_CENTER_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical fractional-phase corpus rejects the round-centered shader.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P168` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P169 `NEGATIVE_CLIPPED_SUPPORT_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical corpus rejects the radius-clipped shader.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P169` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P170 `NEGATIVE_BORDER_DISTANCE_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical border corpus rejects clamped-distance weighting.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P170` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P171 `NEGATIVE_DIRECT_TANGENT_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical axial-wrap corpus rejects direct tangent interpolation.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P171` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P172 `NEGATIVE_DOUBLE_PREMULT_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical alpha corpus rejects double premultiplication.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P172` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P173 `NEGATIVE_RESIDUAL_ALPHA_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical comparator rejects residual alpha mutation.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P173` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P174 `NEGATIVE_COUNTER_STUCK_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Controlled faults reject a counter buffer that remains zero.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P174` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P175 `NEGATIVE_TIMESTAMP_WALLCLOCK_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The evidence validator rejects CPU wall-clock timing as GPU timing.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P175` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P176 `NEGATIVE_LEAK_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The residency validator rejects an intentionally leaked resource.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P176` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P177 `NEGATIVE_STALE_EPOCH_DETECTED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The recovery validator rejects reuse of an old-epoch pipeline.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P177` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P178 `CHILD_ARTIFACT_DIGESTS_VALID`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Every child evidence artifact digest validates at finalization.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P178` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P179 `PHYSICAL_GATE_RECEIPT_COMPLETE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The physical receipt contains every PHYSICAL_MANDATORY result.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P179` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P180 `NO_PENDING_PHYSICAL_GATE`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No physical gate remains pending or deferred.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P180` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P181 `NO_PHYSICAL_FAIL`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** No physical gate is failed or skipped.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P181` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P182 `FINAL_PACKAGE_IDENTITY_MATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The final receipt references the same package candidate frozen before execution.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P182` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P183 `FINAL_ADAPTER_IDENTITY_MATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** All physical child receipts reference the same primary adapter profile except post-loss device epoch.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P183` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P184 `FINAL_KERNEL_IDENTITY_MATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** All lowpass child receipts reference the R8 canonical kernel identity.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P184` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P185 `FINAL_ORACLE_IDENTITY_MATCH`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** All oracle comparisons reference the same independent oracle and binary16 comparator identities.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P185` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P186 `FINAL_PRODUCTION_POINTER_UNCHANGED`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** Production Pointer remains unchanged after final physical acceptance.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P186` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

## R9-P187 `FINAL_STATE_CORRECT`

- **Class:** `PHYSICAL_MANDATORY`
- **Requirement:** The final state is RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10.
- **PASS:** Package-bound hardware evidence satisfies the requirement on the frozen adapter, device profile, package candidate, and fixture manifest.
- **FAIL:** Execution, comparison, counter, timing, residency, recovery, or package evidence violates the requirement or cannot be independently validated.
- **PENDING:** Allowed only in the source-harness receipt before physical execution. It is forbidden in final acceptance.
- **Receipt:** `R9-P187` records child artifact digests, observed values, package identity, adapter/device epoch, and stable error code when applicable.

# 27. Source-Harness Acceptance

The source-harness receipt is accepted only when:

```text
SOURCE_MANDATORY count = 110
SOURCE PASS            = 110
SOURCE FAIL            = 0
PHYSICAL_MANDATORY     = 187
PHYSICAL PENDING       = 187
PHYSICAL PASS          = 0
Production Pointer     = unchanged
```

Its state is:

```text
RESAMPLE_RUNTIME_R9_PHYSICAL_HARNESS_SOURCE_BAKED_AWAITING_WINDOWS_EXECUTION
```

This state means only that the physical test system is ready. It is not evidence that WGSL compiled on hardware, parity passed, counters were read, performance improved, memory plateaued, device loss recovered, or packaged Preview and Export executed.

# 28. Final Physical Acceptance

The final physical receipt is accepted only when:

```text
SOURCE_MANDATORY count   = 110
SOURCE PASS              = 110
PHYSICAL_MANDATORY count = 187
PHYSICAL PASS            = 187
PENDING                   = 0
DEFERRED                  = 0
SKIPPED                   = 0
FAIL                      = 0
package mutation          = 0
Production Pointer        = unchanged
```

Its state is:

```text
RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10
```

A final receipt shall identify the package digest, primary adapter profile digest, initial and recovered device epochs, R8 kernel and ABI identities, fixture manifest digest, all child evidence digests, comparison thresholds, timing sample counts, residency iteration counts, device-loss cycle counts, and the unchanged Production Pointer digest.

# 29. Compact Implementation Checklist

- [ ] Verify the R8 parent ZIP and frozen source digests.
- [ ] Add versioned R9 schemas and stable error codes.
- [ ] Add deterministic fixture manifest and binary blobs.
- [ ] Add independent binary16 packing and ULP ordering.
- [ ] Add package-bound physical runner and narrow IPC bridge.
- [ ] Add source-tree and dev-server isolation guards.
- [ ] Add R9 instrumented validation shaders with an explicit 32-counter layout.
- [ ] Compile all packaged WGSL under error scopes.
- [ ] Run R4 and R6 product/reference raw-word parity.
- [ ] Run binary64 oracle ULP comparisons.
- [ ] Read and persist all validation counters.
- [ ] Run DC, alpha, border, residual-off, and Preview/Export convergence fixtures.
- [ ] Run paired timestamp-query measurements.
- [ ] Run logical GPU residency and process-memory plateau tests.
- [ ] Induce and recover from three controlled device-loss cycles.
- [ ] Execute packaged Preview and Export from the same candidate bytes.
- [ ] Run all physical negative controls.
- [ ] Verify package bytes unchanged after execution.
- [ ] Finalize child digest manifest and physical receipt.
- [ ] Do not move the Production Pointer.

# 30. Next Authority

The next authority is:

```text
TDT-RESAMPLE-RUNTIME-01-R10

Production Candidate Promotion /
Production Pointer Compare-and-Swap /
Rollback Drill /
Release Receipt Seal
```

R10 may consume only an immutable R9 final physical receipt with no pending, deferred, skipped, or failed gate. It shall not reinterpret source-harness readiness as physical acceptance.
