# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3 Applied

## State

`SOURCE_BAKED_AWAITING_EXTERNAL_BUILD_AND_THREE_CYCLE_PHYSICAL_GPU`

## Applied authority changes

- Canonical EWA, Structure Tensor, and Adaptive Policy pipelines now live under one epoch-bound registry authority.
- Registry keys bind runtime epoch, device epoch, device identity, adapter identity, and the existing legacy-pipeline owner.
- Concurrent callers for the same key join one BUILDING entry and one physical build.
- Build tokens guard ACTIVE commit against entry replacement, invalidation, lease staleness, and GPU identity drift.
- Old-epoch ACTIVE and BUILDING entries are invalidated and terminally disposed before recovery rebuild admission.
- Adaptive Policy bundles now expose epoch, device, ABI, shader, pipeline, and neutral Q-map identities with idempotent disposal.
- Recovery holder invalidates the old registry entry, acquires the admitted legacy-pipeline lease, and eagerly rebuilds EWA, Tensor, and Adaptive families before entering VALIDATING.
- GPU Authority collects sorted participant rebuild evidence and publishes its canonical set digest in the recovered event.
- Cycle closure and validation admission now carry invalidation, rebuild, pipeline-set, and participant-set lineage.
- Post-recovery validation refuses to begin without the exact rebuilt registry entry and fails if validation causes a lazy build.

## Source proof

- Source Gate target: `120 PASS / 0 FAIL`
- Single-flight unit matrix: callers `2 / 4 / 8`, one physical build per matrix row
- Late-completion unit: revoked build cannot commit and the returned pipeline root is disposed once
- Source negative controls: validation-before-rebuild, old-pipeline reuse, duplicate eager rebuild, malformed invalidation, and Adaptive omission are denied
- Parent R2-R1 and R2-R2 evidence bytes are preserved against the recorded parent ZIP baseline

## Physical boundary

The source bake does not claim a packaged physical pass. Production installation and the Preview / Export / Preview recovery replay remain pending until an admitted external build is available.
