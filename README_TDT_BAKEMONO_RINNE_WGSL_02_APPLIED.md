# TDT-BAKEMONO-RINNE-WGSL-02 APPLIED

This tree contains the source-baked, shadow-only WebGPU compatibility implementation of the admitted Bakemono/Rinne legacy fusion formula.

- Formula authority remains `app/legacy-runtime/shaders/rinne_bakemono_fusion_frag.glsl`.
- Color utility authority remains `app/legacy-runtime/shaders/glsl_util.glsl`.
- The generated compute kernel has a frozen compatibility ABI and no Tensor binding.
- The runtime can record one shadow compute pass and may submit only through the qualification wrapper.
- The output is `rgba16float`, linear-premultiplied, caller-owned, and `SHADOW_ONLY`.
- No R9A command graph, Surface Registry, Preview, Export, or Canonical Final Texture authority is granted.
- Physical WebGPU and original WebGL parity remain pending until the Electron qualification harness runs on admitted hardware.

Canonical status: `SOURCE_BAKED_AWAITING_PHYSICAL_GPU`.
