# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2 Applied

Source-baked integration of a recovery-aware runtime holder into the normal Runtime Composition.

Implemented source authority:

- qualification-scoped exact three-cycle recovery budget
- main-issued one-shot controlled-loss permits
- same RuntimeServiceContainer across all recovery cycles
- Preview pending-submit and Export pending-encode loss hooks
- old lease rejection and new lease reacquisition
- explicit canonical pipeline lifecycle registry
- old pipeline invalidation and replacement pipeline rebuild
- PipelineService final-surface revocation on device loss
- mandatory post-recovery fixture republish and public Preview/Export validation
- raw recovery evidence surfaces and fail-closed packaged finalizer

Current authority state:

- 360 SOURCE PASS
- 420 PACKAGED PENDING
- 0 FAIL
- normal recovery policy remains `maxAttemptsPerRuntimeEpoch = 1`
- qualification recovery budget installed = false
- controlled loss executed = false
- device-loss recovery cycle count = 0
- package-lock unchanged
- Production Pointer unchanged
- Local Activation Pointer unchanged
- historical pass carry-forward = 0

No packaged Electron GPU device-loss execution was performed by this source bake. The packaged gate remains fail-closed until Build Lock R2 Win32 admission, R1 packaged qualification, and real three-cycle recovery evidence are available.
