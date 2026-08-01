import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  PACKAGED_OUT,
  check,
  readJson,
  exists,
  verifySelf,
  seal,
  packagedArtifact,
  sha256File,
} from './lib.mjs';

const PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1';
const required = [
  'R9AP1R2_OPERATION_LOSS_LEDGER.json',
  'R9AP1R2_DEVICE_EPOCH_LEDGER.json',
  'R9AP1R2_POST_RECOVERY_VALIDATION_LEDGER.json',
  'R9AP1R2_THREE_CYCLE_MATRIX_RECEIPT.json',
  'R9AP1R2R1_PREVIEW_TERMINAL_LEDGER.json',
  'R9AP1R2R1_EXPORT_TERMINAL_LEDGER.json',
  'R9AP1R2R1_RECOVERY_CORRELATION_LEDGER.json',
  'R9AP1R2R1_CHILD_ARTIFACT_MANIFEST.json',
  'R9AP1R2R1_FAILURE_ORDER_NEGATIVE_LEDGER.json',
];

for (const name of required) check(exists(`artifacts/resample-runtime-01-r9a-p1-r2/packaged/${name}`), 'E_R9AP1R2R1_CHILD_EVIDENCE_MISSING', 'Packaged child evidence missing', { name });
const load = (name) => {
  const relative = `artifacts/resample-runtime-01-r9a-p1-r2/packaged/${name}`;
  const value = readJson(relative);
  check(verifySelf(value), 'E_R9AP1R2R1_CHILD_SELF_HASH', 'Packaged child self hash invalid', { name });
  return value;
};

const operation = load(required[0]);
const epochs = load(required[1]);
const validation = load(required[2]);
const matrix = load(required[3]);
const previewRaw = load(required[4]);
const exportRaw = load(required[5]);
const correlation = load(required[6]);
const manifest = load(required[7]);
const failureOrder = load(required[8]);

const manifestEntries = Array.isArray(manifest.children) ? manifest.children : [];
for (const name of required.filter((entry) => entry !== 'R9AP1R2R1_CHILD_ARTIFACT_MANIFEST.json')) {
  const row = manifestEntries.find((entry) => entry.name === name);
  check(row, 'E_R9AP1R2R1_MANIFEST_COVERAGE', 'Child manifest does not cover required evidence', { name });
  const relative = `artifacts/resample-runtime-01-r9a-p1-r2/packaged/${name}`;
  check(row.sha256 === sha256File(relative), 'E_R9AP1R2R1_MANIFEST_HASH', 'Child manifest hash mismatch', { name });
}

const operationRows = Array.isArray(operation.rows) ? operation.rows : [];
check(operationRows.length === 3, 'E_R9AP1R2R1_OPERATION_COUNT', 'Expected exactly three lost operation rows');
const expectedKinds = ['preview', 'export', 'preview'];
const expectedCodes = ['E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST', 'E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST', 'E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST'];
for (let index = 0; index < 3; index += 1) {
  const row = operationRows[index];
  check(row.operationKind === expectedKinds[index], 'E_R9AP1R2R1_OPERATION_ORDER', 'Lost operation order mismatch', { index, row });
  check(row.terminal === 'rejected' && row.errorCode === expectedCodes[index], 'E_R9AP1R2R1_OPERATION_TERMINAL', 'Lost operation was not rejected with exact public error', { index, row });
  check(typeof row.cycleBindingDigest === 'string' && typeof row.operationTerminalReceiptDigest === 'string', 'E_R9AP1R2R1_OPERATION_DIGEST', 'Lost operation digest linkage missing', { index, row });
}

const previewRows = Array.isArray(previewRaw.snapshot?.receipts) ? previewRaw.snapshot.receipts : []; // previewRaw.rows semantic replay source
const previewLostDigests = new Set(operationRows.filter((row) => row.operationKind === 'preview').map((row) => row.operationTerminalReceiptDigest));
const previewPresentedCount = previewRows.filter((row) => previewLostDigests.has(row.digestSha256) && row.state === 'PRESENTED').length;
const previewLostCount = previewRows.filter((row) => previewLostDigests.has(row.digestSha256) && row.state === 'DEVICE_LOST').length;
check(previewPresentedCount === 0 && previewLostCount === 2, 'E_R9AP1R2R1_PREVIEW_RAW_REPLAY', 'Preview raw replay detected false success or missing loss receipt', { previewPresentedCount, previewLostCount });

const exportRows = Array.isArray(exportRaw.authorityEvidence?.r9aP1R2R1TerminalLedger) ? exportRaw.authorityEvidence.r9aP1R2R1TerminalLedger : []; // exportRaw.rows semantic replay source
const exportOperation = operationRows[1];
const exportRow = exportRows.find((row) => row.operationTerminalReceiptDigest === exportOperation.operationTerminalReceiptDigest);
check(exportRow, 'E_R9AP1R2R1_EXPORT_RAW_REPLAY', 'Export terminal raw row missing');
const hostSaveBeginCount = exportRows.reduce((sum, row) => sum + Number(row.hostSaveBeginCount ?? 0), 0);
const hostSaveReceiptCount = exportRows.reduce((sum, row) => sum + Number(row.hostSaveReceiptCount ?? 0), 0);
check(hostSaveBeginCount === 0 && hostSaveReceiptCount === 0 && exportRow.hostSaveStarted === false, 'E_R9AP1R2R1_EXPORT_SAVE_CONTAMINATION', 'Export save occurred after lost terminal map', { hostSaveBeginCount, hostSaveReceiptCount });

const epochRows = Array.isArray(epochs.rows) ? epochs.rows : [];
check(epochRows.length === 3, 'E_R9AP1R2R1_EPOCH_COUNT', 'Expected three device epoch rows');
const runtimeEpochPairs = new Set();
for (const row of epochRows) {
  runtimeEpochPairs.add(`${row.oldRuntimeEpoch}:${row.newRuntimeEpoch}`);
  check(row.oldRuntimeEpoch === row.newRuntimeEpoch, 'E_R9AP1R2R1_RUNTIME_EPOCH', 'Runtime epoch changed within cycle', { row });
  check(row.newDeviceEpoch === row.oldDeviceEpoch + 1, 'E_R9AP1R2R1_EPOCH_STEP', 'Replacement epoch is not exact old+1', { row });
  check(row.oldDeviceIdentity !== row.newDeviceIdentity, 'E_R9AP1R2R1_DEVICE_IDENTITY', 'Device identity did not change', { row });
  check(row.oldAdapterIdentity === row.newAdapterIdentity, 'E_R9AP1R2R1_ADAPTER_IDENTITY', 'Adapter identity changed', { row });
}
check(runtimeEpochPairs.size === 1, 'E_R9AP1R2R1_RUNTIME_EPOCH', 'Runtime epoch changed across cycles');

const correlationRows = Array.isArray(correlation.authorityEvidence?.r9aP1R2R1EventLedger) ? correlation.authorityEvidence.r9aP1R2R1EventLedger : [];
for (const operationRow of operationRows) {
  const rows = correlationRows.filter((row) => row.cycleBindingDigest === operationRow.cycleBindingDigest);
  const count = (kind) => rows.filter((row) => row.kind === kind).length;
  check(count('raw-device-destroy-requested') === 1, 'E_R9AP1R2R1_DESTROY_REPLAY', 'Destroy count is not exactly one', { cycleBindingDigest: operationRow.cycleBindingDigest });
  check(count('device-lost') === 1 && count('device-recovered') === 1 && count('waiter-settled-recovered') === 1, 'E_R9AP1R2R1_CORRELATION_REPLAY', 'Exact event correlation sequence incomplete', { cycleBindingDigest: operationRow.cycleBindingDigest, rows });
  check(count('waiter-timeout') === 0 && count('waiter-settled-failed') === 0, 'E_R9AP1R2R1_CORRELATION_CONTAMINATION', 'Terminal cycle contains timeout or failure contamination', { cycleBindingDigest: operationRow.cycleBindingDigest });
}

check(failureOrder.eventSequence < failureOrder.fatalSequence && failureOrder.synchronouslyObserved === true, 'E_R9AP1R2R1_FAILURE_ORDER', 'Failure-order negative injection did not observe event before fatal', { failureOrder });

const validationRows = Array.isArray(validation.rows) ? validation.rows : [];
check(validationRows.length === 3, 'E_R9AP1R2R1_VALIDATION_COUNT', 'Expected three post-recovery validation rows');
const lostIds = new Set(operationRows.map((row) => row.operationId));
for (const row of validationRows) {
  check(row.preview === true && row.export === true, 'E_R9AP1R2R1_VALIDATION_RESULT', 'Post-cycle validation failed', { row });
  check(!lostIds.has(row.previewOperationId) && !lostIds.has(row.exportOperationId), 'E_R9AP1R2R1_VALIDATION_OPERATION_REUSE', 'Lost operation ID was reused by validation', { row });
}

check(matrix.controlledLossCount === 3 && matrix.previewPendingLossCount === 2 && matrix.exportPendingLossCount === 1, 'E_R9AP1R2R1_MATRIX', 'Three-cycle matrix mismatch');
check(matrix.historicalPassCarryForward === 0, 'E_R9AP1R2R1_HISTORICAL_PASS', 'Historical packaged pass carried forward');

const forbiddenOutputNames = new Set(['r9a-p1-r2-r1-loss-2.png', 'r9a-p1-r2-r1-loss-2.webp', 'r9a-p1-r2-r1-loss-2.jxl']);
const outputFileCount = fs.readdirSync(PACKAGED_OUT, { withFileTypes: true }).filter((entry) => entry.isFile() && forbiddenOutputNames.has(entry.name)).length;
check(outputFileCount === 0, 'E_R9AP1R2R1_OUTPUT_FILE', 'Lost Export created an output file', { outputFileCount });

const finalReceipt = seal({
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r1.packaged-final-receipt.v1',
  receiptKind: 'resample-runtime-r9a-p1-r2-r1-packaged-final',
  patchId: PATCH_ID,
  state: 'PHYSICAL_SEMANTIC_SEAL_PASS',
  counts: { PASS: 26, PENDING: 0, FAIL: 0 },
  controlledLossCount: 3,
  previewLostPresentedCount: previewPresentedCount,
  exportHostSaveBeginCount: hostSaveBeginCount,
  exportHostSaveReceiptCount: hostSaveReceiptCount,
  lostExportOutputFileCount: outputFileCount,
  exactCycleBindingCount: new Set(operationRows.map((row) => row.cycleBindingDigest)).size,
  rawChildSelfHashCount: required.length,
  historicalPassCarryForward: 0,
  summaryTrustCount: 0,
});
packagedArtifact('TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R1_PACKAGED_FINAL_RECEIPT.json', finalReceipt);
console.log('TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1 26 PACKAGED PHYSICAL PASS / 0 FAIL');
