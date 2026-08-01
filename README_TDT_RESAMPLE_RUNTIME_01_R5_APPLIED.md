# TDT-RESAMPLE-RUNTIME-01-R5 APPLIED

State: `RESAMPLE_RUNTIME_R5_AXIAL_SUBPIXEL_CONTINUITY_SEALED_AWAITING_R6`

This bake adds a GPU axial conversion pass after the existing tangent eigen pass, keeps the published tangent Analysis Field unchanged, and binds the stage-local axial texture to the R5 EWA product, validation, and direct-load reference shaders.

Canonical field identity: `tdt.structure-tensor.axial-coherence-edge.r5.v1`

Source verification: `132 PASS / 5 DEFERRED / 0 FAIL`. Physical WGSL compilation, physical axial texture parity, physical product/reference parity, validation counter readback, and packaged Electron identity remain deferred.

Run: `npm run verify:resample-runtime-01-r5`
