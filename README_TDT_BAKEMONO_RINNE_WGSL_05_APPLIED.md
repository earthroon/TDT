# TDT-BAKEMONO-RINNE-WGSL-05 Applied

Status: `SOURCE_BAKED_AWAITING_PHYSICAL_GPU`

WGSL-05 promotes the WGSL-04 graph-native Bakemono/Rinne candidate to the single canonical terminal texture before the one R9A submit. The adopted texture becomes the only Surface Registry payload, ownership transfers atomically from `ResampleWorkerBroker` to `PipelineService`, and Preview/Export are required to consume the same final surface tuple.

Implemented boundaries:

- transferable candidate state machine: `AVAILABLE -> ADOPTED | RELEASED`
- final EWA identity path and Bakemono/Rinne final path
- composite EWA -> terminal R1C -> effect execution identity
- canonical final output receipt and descriptor
- superseded owned EWA retirement after submission completion
- duplicate GPU texture ownership rejection
- two-phase Surface Registry final ownership adoption
- failure-atomic Pipeline publication
- canonical legacy bridge re-entry rejection
- Preview/Export shared final surface tuple validation
- no dual final texture authority
- no second submit and no intermediate readback claim expansion

Physical WebGPU, packaged Electron, and cross-consumer presentation/export gates remain pending until the external dependency closure is available.
