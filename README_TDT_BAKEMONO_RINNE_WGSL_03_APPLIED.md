# TDT-BAKEMONO-RINNE-WGSL-03 Applied

Terminal-resolution integrated R1C reconstruction and the distinct R1C-gated canonical shadow ABI are source-baked in this tree.

- Parent: WGSL-02 compatibility compute shadow
- Compatibility ABI remains unchanged and tensor-free
- Canonical ABI is a distinct 9-binding identity
- Tensor source is FINAL_EWA_TERMINAL only
- R1C order is gradient -> outer -> blurH -> blurV -> eigen -> axial
- Canonical effect consumes admitted tangent/coherence/edge fieldTexture only
- Raw, integrated, axial, stage-local and legacy tensor passage is denied
- Lambda2 qualification is device and shader-set scoped, not a per-operation readback
- Output authority remains CANONICAL_CANDIDATE_SHADOW_ONLY
- R9A product graph, final texture, preview and export promotion remain out of scope

Status: SOURCE_BAKED_AWAITING_PHYSICAL_GPU
