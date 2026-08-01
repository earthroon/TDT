# TDT-EXPORT-WORKER-02 Applied

## Status

- Patch: `TDT-EXPORT-WORKER-02`
- Status: `SOURCE_BAKED_UNPROMOTED`
- Final Promotion PASS: **not issued**
- Build ID: `7ae69d05bf5e825df68983ec`
- Source bake seal: `b139a0fe420b0a6c4851da13ac6e30dd8c231c9b47ce8879010fae51f7026c52`
- Worker source manifest digest: `4e029d9934f5837c37fb02d5117751cec93490a217035dd7e1dfddbb9e900c1a`

## Applied authority change

EW01 gave the Runtime authority over Worker construction, URL identity, handshake, epoch, and source artifact identity. EW02 extends that authority to every encoder Worker job.

```text
Legacy ExportManager
→ DadumRuntimeWorkerBridge.call()
→ Broker job admission
→ Broker-owned input snapshot
→ per-Worker FIFO queue
→ one active job
→ dadum-worker-rpc-v1
→ ACCEPTED
→ RESULT | ERROR | CANCELLED
→ exactly-once settlement
→ Worker Job Receipt
→ Export Receipt
```

The product path no longer exposes raw Worker leases. Legacy WebP, PNG16, and flattened PSD callers do not own job IDs, pending maps, message listeners, Worker termination, or job settlement.

## Implemented contracts

### Broker-owned job SSOT

- Deterministic job ID authority: `wj:<runtimeEpoch>:<workerId>:<generation>:<sequence>`
- Per-Worker FIFO queue
- Maximum one active job per Worker instance
- Maximum eight queued jobs per Worker
- Maximum queued input budget: 512 MiB per Worker
- Broker-only pending map and active slot
- Bounded Worker Job Receipt ledger: 256 records

### Unified RPC

- RPC protocol: `dadum-worker-rpc-v1`
- Commands: `CALL`, `ACCEPTED`, `RESULT`, `ERROR`, `CANCEL`, `CANCELLED`
- Operation allowlist:
  - `encode.webp-lossless`
  - `encode.png16`
  - `encode.psd-flattened`
- Worker control protocol from EW01 remains `dadum-worker-control-v1`

### Timeout and cancellation

- Queue timeout
- Execution timeout
- AbortSignal admission and runtime handling
- Cooperative cancel grace period
- Hard terminate and generation restart when cooperative cancellation does not close
- Late replies cannot create successful Export Receipts

Default execution timeouts:

| Worker | Timeout |
|---|---:|
| WebP Lossless | 120 s |
| PNG16 | 120 s |
| PSD Flattened | 180 s |

### Crash and restart

- `error` and `messageerror` close the active generation
- Active job fails without automatic replay
- Queued jobs resume only after the replacement generation reaches READY
- Restart budget: three restarts within 60 seconds
- Backoff: 0 ms, 250 ms, 1000 ms
- Budget exhaustion opens the Worker circuit

### Input ownership

- `broker-transfer-snapshot-v1`
- `broker-copy-snapshot-v1`
- `broker-shared-copy-v1`
- Transfer hints accept only `ArrayBuffer`
- Caller-side silent detach and silent copy are forbidden

### Receipt binding

Successful Worker-backed exports now bind:

- Worker job ID
- Worker Job Receipt ID and digest
- RPC protocol version
- terminal state `result`
- Worker generation and epoch evidence
- existing R7 final-surface and encoder identity evidence

## Changed product paths

- `app/src/runtime/workers/encoder-worker-broker-service.ts`
- `app/src/runtime/workers/encoder-worker-types.ts`
- `app/src/runtime/workers/worker-entry-runtime.ts`
- three encoder Worker entries
- `app/legacy-runtime/export_manager.js`
- `app/legacy-runtime/libs/psd/psd_export_bridge.js`
- Runtime export authority and receipt
- Runtime module identities and stable error registry
- EW01/R7 inherited gates
- new EW02 24-gate verifier

## Verification

Passed:

- inherited R1-R6 source gates
- R7 gates 01-15
- EW01 gates 01-20
- EW02 gates 01-24
- Receipt determinism 100/100
- TypeScript syntax: 59 units
- stable error registry: 79/79
- strict TypeScript closure using dependency declaration stubs
- changed JavaScript/MJS syntax
- actual Broker smoke with FIFO, queued cancel, active crash, generation restart, queued resume, and terminal pending count zero

Runtime smoke result:

```text
PASS RT-EW02-SMOKE FIFO=2 queued-cancel=1 crash-restart=1 receipts=6 restarts=1
```

## Promotion blockers

The current environment has no installed `vue-tsc`/Vite dependency graph. `npm run verify:renderer` stopped at `vue-tsc: not found` with exit code 127.

Therefore this bake does not claim:

- Vite production Worker bundles
- emitted Worker JS/WASM SHA-256 verification
- Electron Worker E2E
- real WebP Lossless WASM encode
- real PNG16 LodePNG WASM encode
- real PSD Rust/WASM encode
- production crash/restart behavior under Electron

Artifact verification remains `source-graph-only` and the result remains `SOURCE_BAKED_UNPROMOTED`.
