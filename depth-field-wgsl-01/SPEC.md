# TDT-DEPTH-FIELD-WGSL-01

## Seal

Final EWA Source / Shared Terminal R1C / Tangent-Normal Multi-Radius DoG / Canonical Analysis Field Publication / R9A Graph Native / Zero Readback

- State: `SOURCE_BAKED_AWAITING_PHYSICAL_GPU`
- Full specification SHA-256: `957584484197df65ca4d78bb0c0664b6aadaf37b2b2ddfc45cef6589a9fe5859`
- Parent code bundle SHA-256: `3cb00cefabcc1cf58f4295e911082d447f87eb49494bb14c124644afe3a5042c`
- Code ZIP is not tracked in this repository.

## Authority

```text
Final EWA rgba16float linear-premultiplied
→ shared Terminal Integrated R1C
→ tangent-normal depth WGSL pass
→ graph submission fence
→ Analysis Field Authority publication
```

- Semantic: `tdt.analysis.depth.tangent-relief.v1`
- Producer: `tdt.analysis.producer.depth.tangent-relief.wgsl`
- Pipeline family: `tdt.pipeline.depth.tangent-relief.wgsl01.v1`
- Output: `rgba16float`
- R: signed relief `[-1, 1]`
- G: relief magnitude `[0, 1]`
- B: coherence × edge × validity
- A: coverage and tangent validity

## Canonical formula

```text
normal = (-tangent.y, tangent.x)

dNear = 2Y(C) - Y(C + 0.6n) - Y(C - 0.6n)
dFar  = 2Y(C) - Y(C + 1.2n) - Y(C - 1.2n)

bandPass = dNear - 0.7 dFar
signedRelief = clamp(
  bandPass × mix(0.4, 1.0, coherence) / 3.4,
  -1,
  1
)
```

Luminance is derived from alpha-aware linear-straight RGB. Transparent neighbors use center luminance and do not create a black trench.

## Graph contract

```text
Terminal R1C passes       6
Depth pass                1
Combined passes           7
Uniform ring allocations  2
Recorder-created encoder  0
Recorder queue submit     0
Intermediate readback     0
```

Terminal R1C is produced once per operation and may be consumed read-only by both Depth Field and Bakemono/Rinne.

## Denials

- No caller-supplied depth texture
- No raw or legacy tensor admission
- No luma-proxy depth authority
- No CPU depth product compute
- No WebGL depth product compute
- No `mapAsync` or intermediate pixel readback
- No independent encoder or queue submit
- No Final Texture RGB or alpha mutation

The historical `webgpu_depth_bake.js` path remains diagnostic and non-authoritative.

## Source evidence

- Source Gate: `256 / 256 PASS`
- Negative controls: `72 / 72 detected`
- Graph unit: `PASS`
- Active Graph: `30 PASS / 10 DEFERRED / 0 FAIL`
- Patch reapplication: `PASS`, content diff `0`
- ZIP re-extraction verification: `PASS`
- Physical Gate: `0 PASS / 80 PENDING / 0 FAIL`

Physical WebGPU PASS is not claimed because dependency installation is blocked by registry HTTP 404 for `@napi-rs/cli@2.18.4`.

## Repository policy

This repository stores only the compact specification, manifest, and source-bake artifact for this patch. The generated code ZIP and its binaries are excluded.
