# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2 Applied

## Patch

Just-In-Time Controlled Loss Permit / Full-Field Canonical Integrity / Qualification Sender Ownership / Arm-Consume Sender Continuity / Epoch-Device-Closure Exact Binding / Single-Use Nonce Tombstone / No Renderer Permit Mutation Seal

## Applied runtime changes

- Replaced three pre-issued recovery permits with a three-intent plan and per-cycle JIT issuance.
- Bound the authority to BrowserWindow, WebContents, renderer PID, Electron partition, preload document nonce, package closure, R1 boot permit, and qualification session.
- Added exact permit and issue-receipt body replay against Main-owned immutable originals.
- Added fixed 60-second permit TTL, request nonce replay denial, consume nonce replay denial, and atomic single-use tombstones.
- Promoted cycle binding to v2 with owner, plan, parent permit, issue receipt, tombstone, operation detail, and GPU identity lineage.
- Required Main-process cycle closure acknowledgement before the next permit may be issued.
- Disabled legacy R2 plan and consume IPC channels during R2-R2 qualification.
- Extended GPU recovered/failed event correlation with owner, permit, issue receipt, and tombstone digests.

## Verification state

- Source Gate: 120/120 PASS
- Full-field mutation acceptance: 0/24
- Concurrent consume: exactly 1 success, exactly 1 rejection
- Packaged Physical Gate: 0/36 PENDING
- Physical recovery cycles: 0/3 PENDING

No packaged Electron or physical GPU PASS is claimed by this source bake.
