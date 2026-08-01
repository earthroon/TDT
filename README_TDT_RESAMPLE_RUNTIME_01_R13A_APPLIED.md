# TDT-RESAMPLE-RUNTIME-01-R13A Applied

State: `RESAMPLE_RUNTIME_R13A_FLEET_TO_LOCAL_TRANSITION_BINDING_SOURCE_SEALED_AWAITING_R12A_INSTALLED_AND_QUALIFIED_FLEET`

## Acceptance

- Source: `786 PASS`
- Fleet: `744 PENDING`
- Fail: `0`
- Production Pointer mutation: `false`
- Local Activation Pointer mutation: `false`
- Fleet execution performed: `false`
- Historical PASS carry-forward: `0`

## Implemented authority chain

```text
signed rollout plan v2
→ installation admission
→ update lease v2
→ lease claim
→ signed drain permit
→ fsynced fleet transition binding
→ R12A transaction and 10-child installed replay
→ local completion receipt
→ durable evidence outbox
→ signed fleet acknowledgement
→ exact aggregate recomputation
→ k=5 privacy report recomputation
→ ring decision
→ phase-aware containment and recovery replay
→ raw-artifact fleet finalizer v2
```

R13A does not write the Production Pointer or Local Activation Pointer. R12A remains the local update authority, R11A remains the installed-session authority, and R10A remains the Production Pointer authority.

## Verification

```bash
npm run verify:resample-runtime-01-r13a
npm run verify:active-graph-01:source
npm run verify:resample-runtime-01-r8a:parser
npm run verify:resample-runtime-01-r13a:fleet
```

The fleet verifier must fail with `E_R13A_R12A_INSTALLED_RECEIPT_MISSING` until qualified R12A installed evidence and fleet artifacts are supplied.

## Remaining external evidence

- R9A physical final receipt
- R10A release final receipt
- R11A installed final receipt
- R12A installed final receipt and complete child chain
- qualified multi-installation fleet artifacts
- signed evidence acknowledgements
- containment and recovery replay artifacts
- `744 FLEET PASS`

The inherited runtime dependency-lock mismatch remains unresolved, so this source candidate is not promotable.
