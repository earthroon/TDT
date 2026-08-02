# TDT-ALPHA-SENSITIVITY-WGSL-01

## Seal

Legacy Alpha Sensitivity Formula Inventory / Canonical Alpha Response Field / Linear-Straight Luminance / Premultiplied Alpha Preservation / Legacy Re-Premultiply Qualification / R9A Graph Native / Zero Readback / No Hidden Final Alpha Mutation

- State: `SOURCE_BAKED_AWAITING_PHYSICAL_GPU`
- Full specification SHA-256: `463049b6e2a4fe7b03dd49c1d5894435291ea2a052f2fe7216a906b092c57bf6`
- Code bundle SHA-256: `d127a20550192cbe15736075a0ae7cd674e4b2c1ff92bd06611050e889d0e8a6`
- The code ZIP is not tracked in this repository.

## Canonical authority

```text
Final EWA rgba16float linear-premultiplied
→ Alpha Sensitivity WGSL one-pass producer
→ graph submission fence
→ Analysis Field Authority publication
```

- Semantic: `tdt.analysis.alpha-sensitivity.response.v1`
- Producer: `tdt.analysis.producer.alpha-sensitivity.wgsl`
- Pipeline: `tdt.pipeline.alpha-sensitivity.response-field.wgsl01.v1`
- Output: `rgba16float`
- R: alpha response
- G: linear-straight BT.709 highlight
- B: coverage confidence
- A: validity

## Canonical formula

```text
coverage = clamp(base.a, 0, 1)
straightLinear = base.rgb / max(coverage, alphaEpsilon)
highlight = clamp(dot(straightLinear, vec3(0.2126, 0.7152, 0.0722)), 0, 1)
response = clamp(coverage * (1 + sensitivity * highlight), 0, 1)
```

The producer emits an Analysis Field only. It does not modify Final EWA RGB or coverage alpha.

## ABI and graph contract

```text
binding 0 = Final EWA texture
binding 1 = rgba16float response field
binding 2 = 64-byte uniform ring slice
workgroup = 8 x 8 x 1
```

- canonical passes: `1`
- uniform ring allocations: `1`
- recorder-created encoders: `0`
- recorder queue submits: `0`
- intermediate readbacks: `0`
- Final RGB mutations: `0`
- Final alpha mutations: `0`

With DEPTH-FIELD-WGSL-01 enabled:

```text
Terminal R1C  6 passes
Depth Field   1 pass
Alpha Field   1 pass
Total         8 passes
```

## Legacy qualification boundary

The frozen legacy shader remains non-authoritative.

- Legacy source SHA-256: `554e7c1b58568f7a56204d36beefff119148fb7cc07f6b5cfb0b3eddc289f293`
- Compatibility pipeline: `tdt.pipeline.alpha-sensitivity.legacy-compat-shadow.wgsl01.v1`
- Authority: `QUALIFICATION_SHADOW_ONLY`
- Product admission: `forbidden`

The qualification path restores straight linear RGB, evaluates the frozen encoded-sRGB luminance formula, computes the legacy alpha, and re-premultiplies RGB by the new alpha. It cannot publish a Canonical Final Surface or an Analysis Field.

## Denials

- No caller-supplied alpha response texture
- No hidden Final alpha mutation
- No straight/premultiplied ambiguity
- No Depth or R1C dependency
- No CPU or WebGL product compute
- No `mapAsync` or intermediate pixel readback
- No independent encoder or queue submit
- No legacy qualification output promotion

## Source evidence

- Source Gate: `256 / 256 PASS`
- Negative controls: `72 / 72 detected`
- Alpha graph unit: `PASS`
- DEPTH + ALPHA graph unit: `PASS`
- Active Graph: `30 PASS / 10 DEFERRED / 0 FAIL`
- DEPTH regression: `PASS`
- TypeScript changed contract: `PASS`
- Clean-parent patch apply: `PASS`
- Patch content diff: `0`
- Fresh ZIP extraction: `256 / 256 PASS`, `72 / 72 detected`
- ZIP excluded specs, manifests, artifacts, tools, and nested ZIPs
- Physical Gate: `0 PASS / 80 PENDING / 0 FAIL`

Physical WebGPU PASS is not claimed. Dependency installation remains held by registry HTTP 404 for `@napi-rs/cli@2.18.4`.
