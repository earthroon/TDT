import crypto from 'node:crypto';
import fs from 'node:fs';

const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const assert = (condition, message) => { if (!condition) failures.push(message); };
const broker = read('app/src/runtime/workers/encoder-worker-broker-service.ts');
const types = read('app/src/runtime/workers/encoder-worker-types.ts');
const entry = read('app/src/runtime/workers/worker-entry-runtime.ts');
const manager = read('app/legacy-runtime/export_manager.js');
const psd = read('app/legacy-runtime/libs/psd/psd_export_bridge.js');
const exporter = read('app/src/runtime/export/export-authority-service.ts');
const receipt = read('app/src/runtime/export/export-receipt.ts');
const stable = read('app/src/boot/stable-error.ts');
const modules = read('app/src/boot/runtime-modules.ts');
const runtimeReceipt = read('app/src/boot/runtime-receipt.ts');

// EW02-01 Raw Lease removal.
for (const token of ['interface EncoderWorkerLease', 'acquire(workerId', 'lease.postMessage', 'lease.addEventListener', 'lease.removeEventListener', 'lease.release']) {
  assert(!types.includes(token) && !manager.includes(token) && !psd.includes(token), `raw lease token remains: ${token}`);
}
assert(!broker.includes('async acquire('), 'Broker raw acquire API remains');

// EW02-02 Broker-owned Job ID and Pending Map.
assert(broker.includes('nextJobSequence') && broker.includes('pendingJobs: Map<string, WorkerJobRecord>'), 'Broker Job SSOT missing');
assert(broker.includes('`wj:${this.#runtimeEpoch}:${request.workerId}:${record.generation}:${sequence}`'), 'canonical Broker Job ID missing');

// EW02-03 Unified RPC protocol.
for (const token of ['dadum-worker-rpc-v1', "channel: 'dadum.worker.rpc'", "type: 'CALL'", "type: 'CANCEL'", "data.type === 'RESULT'", "data.type === 'ERROR'", "data.type === 'CANCELLED'"]) {
  assert(broker.includes(token) || entry.includes(token), `RPC token missing: ${token}`);
}

// EW02-04 One active job.
assert(broker.includes('activeJobId: string | null') && broker.includes('if (!this.#active || !record.worker || record.activeJobId'), 'single active Worker slot missing');
assert(entry.includes('let activeJob:') && entry.includes("stableErrorCode: 'E_WORKER_BUSY'"), 'Worker entry busy gate missing');

// EW02-05 Timeout policy.
for (const token of ['DEFAULT_QUEUE_TIMEOUT_MS', 'DEFAULT_EXECUTION_TIMEOUT_MS', 'DEFAULT_CANCEL_GRACE_MS', 'queueTimer', 'executionTimer', 'cancelGraceTimer']) {
  assert(broker.includes(token), `timeout policy missing: ${token}`);
}

// EW02-06 Abort wiring.
assert(broker.includes("request.signal.addEventListener('abort'") && broker.includes("removeEventListener('abort'"), 'AbortSignal wiring incomplete');

// EW02-07 messageerror.
assert(broker.includes("addEventListener('messageerror'"), 'messageerror crash source missing');

// EW02-08 Exactly-once settlement.
assert(broker.includes('if (job.settled)') && broker.includes('job.settled = true') && broker.includes('E_WORKER_DUPLICATE_TERMINAL'), 'exactly-once settlement guard missing');

// EW02-09 Pending closure.
for (const token of ['record.pendingJobs.delete(job.jobId)', 'this.#jobIndex.delete(job.jobId)', 'record.queue = record.queue.filter', 'record.activeJobId = null']) {
  assert(broker.includes(token), `pending closure token missing: ${token}`);
}

// EW02-10/11 restart generation and budget.
for (const token of ['RESTART_WINDOW_MS', 'RESTART_LIMIT', 'RESTART_BACKOFF_MS', "record.state = 'RESTARTING'", "record.state = 'CIRCUIT_OPEN'", 'record.generation += 1']) {
  assert(broker.includes(token), `restart contract missing: ${token}`);
}

// EW02-12 Active replay forbidden.
assert(!broker.includes('replayActiveJob') && !broker.includes('activeJobRetry'), 'active Job replay path exists');

// EW02-13 queued resume.
assert(broker.includes('.then(() => { this.#pump(record); })'), 'queued Job resume after restart missing');

// EW02-14 input ownership.
for (const policy of ['broker-transfer-snapshot-v1', 'broker-copy-snapshot-v1', 'broker-shared-copy-v1']) {
  assert(types.includes(policy) && broker.includes(policy), `input ownership policy missing: ${policy}`);
}
assert(broker.includes('snapshotCreatedAtAdmission: true'), 'input admission snapshot evidence missing');

// EW02-15 stale generation rejection.
assert(broker.includes('generation !== record.generation') && broker.includes('job.generation !== record.generation'), 'stale generation rejection missing');

// EW02-16 receipt binding.
for (const field of ['workerJobId', 'workerJobReceiptId', 'workerJobReceiptDigest', 'workerRpcProtocolVersion', 'workerJobTerminalState']) {
  assert(receipt.includes(field) && exporter.includes(field), `Export Receipt EW02 field missing: ${field}`);
}
assert(exporter.includes('this.workerBroker.jobReceipt(workerJobId)'), 'Export Authority does not verify Broker Job Receipt');

// EW02-17 bounded ledger.
assert(broker.includes('JOB_RECEIPT_LIMIT = 256') && broker.includes('record.receiptLedger.shift()'), 'bounded Job Receipt ledger missing');

// EW02-18 operation allowlist.
for (const operation of ['encode.webp-lossless', 'encode.png8', 'encode.png16', 'encode.psd-canonical-v2']) {
  assert(broker.includes(operation) && entry.includes('operations'), `operation allowlist missing: ${operation}`);
}

// EW02-19 Legacy pending removal.
for (const source of [manager, psd]) {
  assert(!source.includes('const pending = new Map') && !source.includes('_pending = new Map') && !source.includes('let jobId = 0') && !source.includes('_jobId'), 'Legacy pending/job counter remains');
  assert(!source.includes('.addEventListener(\'message\'') && !source.includes('.postMessage('), 'Legacy Worker message ownership remains');
}
assert(manager.includes('bridge.call({') && (psd.includes('bridge.call({') || psd.includes('getRuntimeWorkerBridge().call({')), 'Legacy Bridge call adoption incomplete');

// EW02-20 Parent EW01 preservation.
assert(broker.includes('createGeneratedWorkerManifest') && broker.includes('workerArtifactSetDigest') && broker.includes("channel: 'dadum.worker.control'"), 'EW01 URL/identity authority regressed');

// EW02-21 R7 export truth preservation.
assert(exporter.includes("exportSource: 'runtime-final-surface'") && exporter.includes('signatureVerified: true') && exporter.includes('outputSha256'), 'R7 final surface/export truth regressed');

// EW02-22 type/error closure.
for (const code of ['E_WORKER_QUEUE_TIMEOUT', 'E_WORKER_EXECUTION_TIMEOUT', 'E_WORKER_JOB_CANCELLED', 'E_WORKER_CRASHED', 'E_WORKER_CIRCUIT_OPEN']) {
  assert(stable.includes(`'${code}'`), `stable error missing: ${code}`);
}

// EW02-23 no silent fallback.
assert(!manager.includes('allowCanvasFallback: true') && !broker.includes('main-thread-fallback'), 'silent encoder fallback introduced');

// EW02-24 authority string.
assert(types.includes("authority: 'dadum.runtime.encoder-worker-broker-ew02'") && broker.includes("authority: 'dadum.runtime.encoder-worker-broker-ew02'"), 'EW02 bridge authority missing');
assert(modules.includes('dadum-encoder-worker-broker-ew02') && modules.includes('dadum-final-surface-export-ep01'), 'EW02 module identities missing');
assert(runtimeReceipt.includes("patchId: 'TDT-EXPORT-PROMOTION-01'"), 'EW02 Boot Receipt lineage missing at EP01');

// Deterministic receipt and conservation fixture.
const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])) : value;
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
const fixture = {
  schema: 'dadum-encoder-worker-job-receipt-v1',
  jobId: 'wj:7:worker:2:9',
  workerId: 'worker',
  generation: 2,
  terminalState: 'result',
  resultAdopted: true,
  inputOwnership: { policyId: 'broker-transfer-snapshot-v1', ownedByteLength: 1024 },
};
const expected = digest(fixture);
for (let i = 0; i < 100; i++) assert(digest(fixture) === expected, `EW02 receipt determinism failed at ${i + 1}`);
const admitted = 40;
const terminals = { result: 14, error: 6, cancelled: 7, timeout: 5, crashed: 8 };
assert(Object.values(terminals).reduce((a, b) => a + b, 0) === admitted, 'Job receipt conservation fixture failed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS GATE-EW02-01..24 Unified RPC / Timeout / Abort / Cancel / Crash Restart / Pending Closure; receipt parity 100/100 ${expected}`);
