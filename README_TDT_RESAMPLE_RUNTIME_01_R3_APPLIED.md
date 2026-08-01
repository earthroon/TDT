# TDT-RESAMPLE-RUNTIME-01-R3 APPLIED

## State

```text
RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED
```

R3 did not repair or promote the current product.
R3 established the independent oracle and rejected the current shared round-centered product/reference coordinate model.
R4 is required for product repair.

## Sealed coordinate truth

```text
p = (d + 0.5) * srcPerDst - 0.5
base = floor(p)
sampleCoord = base + integerOffset
delta = sampleCoord - p
```

Border clamping affects the fetch coordinate only. It does not replace the logical coordinate used by the ellipse distance.

## What R3 added

- validation-only IEEE-754 binary64 EWA oracle,
- deterministic fractional-phase fixture manifest,
- WGSL-compatible round-centered negative control,
- static proof that R2 product and direct reference share the same coordinate defect,
- formal predecessor rejection receipt,
- zero runtime CPU fallback and bundle-exclusion audits,
- deterministic source-bake receipts.

## What R3 did not change

- R4 and R6 product WGSL,
- R4 and R6 validation WGSL,
- R1C direct-reference WGSL,
- R2 profile selector,
- R2 parity runtime,
- Final Surface contracts,
- product ABI,
- Production Pointer.

The CPU oracle has no product authority, accepts only bounded sealed fixtures, and is absent from runtime asset authority and active production graph identities.

## Next repair authority

```text
TDT-RESAMPLE-RUNTIME-01-R4
```

R4 must version or replace the pinned product, validation, direct-reference, and tile-coverage sources using the R3 continuous source-lattice convention.
