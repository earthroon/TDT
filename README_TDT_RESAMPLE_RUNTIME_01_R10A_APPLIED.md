# TDT-RESAMPLE-RUNTIME-01-R10A Applied

R8A and R9A current-lineage release requalification harness.

Source state:

```text
RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFICATION_HARNESS_SOURCE_SEALED_AWAITING_R9A_PHYSICAL_AND_PRODUCTION_REBUILD
260 SOURCE PASS
300 RELEASE PENDING
0 FAIL
```

The source verifier never mutates `dadum.export.production-pointer`. Release replay requires `DADUM_R10A_RELEASE_MODE=1`, a current R9A physical final receipt, two independently qualified package generations, explicit operator approval, and the Windows CAS/rollback drill.
