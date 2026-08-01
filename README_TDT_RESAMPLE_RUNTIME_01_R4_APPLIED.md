# TDT-RESAMPLE-RUNTIME-01-R4 APPLIED

State: `RESAMPLE_RUNTIME_R4_PHASE_CORRECT_PRODUCT_REFERENCE_REPAIRED_AWAITING_R5`

- Continuous source lattice: `tdt.ewa.source-lattice.pixel-center-v2`
- Candidate base: `floor(p)`
- Candidate coordinate: `base + integerOffset`
- Exact distance: `sampleCoord - p`
- Border clamp applies only to physical fetch.
- Product shaders use strict shared-tile reads with no direct-load fallback.
- Partial workgroups use the last active destination coordinate.
- R2 assets and R3 oracle evidence remain immutable.
- Physical GPU parity and packaged Electron execution remain deferred.

Gate: 102 PASS / 4 DEFERRED / 0 FAIL.
