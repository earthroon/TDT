# TDT-RESAMPLE-RUNTIME-01-R14A Applied

State: `RESAMPLE_RUNTIME_R14A_SIGNED_DISTRIBUTION_AND_ROLLBACK_RESISTANCE_SOURCE_SEALED_AWAITING_R13A_FLEET_AND_EXTERNAL_DISTRIBUTION`

## Acceptance

- Source: `640 PASS`
- Distribution: `760 PENDING`
- Fail: `0`
- Production Pointer mutation: `false`
- Local Activation Pointer mutation: `false`
- External distribution performed: `false`
- Historical PASS carry-forward: `0`
- Final-writer summary trust count: `0`

## Implemented authority chain

```text
offline root metadata
→ delegated targets / snapshot / timestamp / release roles
→ signed package manifest v2
→ transparency log leaf and inclusion proof
→ checkpoint consistency proof
→ independent witness quorum
→ untrusted origin / mirror / CDN bytes
→ streaming byte and range verification
→ immutable content-addressed cache
→ local monotonic trust state
→ explicit single-use rollback permit
→ R12A staged package admission
→ R13A fleet rollout binding
→ raw-artifact distribution finalizer
```

Origin, mirror, CDN, filename, URL, ETag, Last-Modified, and TLS success are not release authorities. Exact package length and SHA-256, delegated metadata, transparency consistency, witness quorum, revocation generation, and the local rollback floor remain authoritative.

R14A does not write the Production Pointer or Local Activation Pointer. R10A remains the Production Pointer authority, R12A remains the local activation authority, and R13A remains the fleet rollout authority.

## Verification

```bash
npm run verify:resample-runtime-01-r14a
npm run verify:active-graph-01:source
npm run verify:resample-runtime-01-r8a:parser
npm run verify:resample-runtime-01-r14a:distribution
```

The distribution verifier must fail with `E_R14A_DISTRIBUTION_RECEIPT_MISSING` until qualified external distribution artifacts are supplied.

## Source evidence

- Source gates: `640 PASS / 0 FAIL`
- Distribution gates: `760 PENDING`
- Negative controls: `48 PASS / 0 FAIL`
- R14A JavaScript syntax: `59 / 59 PASS`
- R14A TypeScript syntax: `6 / 6 PASS`
- Active Required JavaScript: `243 / 243 PASS`
- Active Graph: `56 roots / 392 nodes / 412 edges`
- R13A predecessor regression: isolated source replay only

## Remaining external evidence

- R9A physical final receipt
- R10A release final receipt
- R11A installed final receipt
- R12A installed final receipt
- R13A fleet final receipt
- real offline root ceremony and delegated production keys
- real release signing and transparency append
- independent witness checkpoint signatures
- origin, mirror, and CDN byte identity receipts
- key rotation and revocation replay
- explicit rollback-permit drill
- `760 DISTRIBUTION PASS`

The inherited runtime dependency-lock mismatch remains unresolved with 12 mismatches. The generated runtime manifest remains `SOURCE_BAKED_UNPROMOTED` and `promotable: false`.
