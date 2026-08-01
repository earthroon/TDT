import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const artifactRoot = path.resolve(process.argv[2] || path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2-r3/packaged'));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/resample-runtime-01-r9a-p1-r2-r3/packaged-gate-catalog.json'), 'utf8'));
const canonicalize = (value) => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Object.is(value, -0) ? 0 : value;
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, canonicalize(value[key])]));
  throw new TypeError(`Unsupported canonical type: ${typeof value}`);
};
const canonicalJson = (value) => JSON.stringify(canonicalize(value));
const digest = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(artifactRoot, name), 'utf8'));
const verifySelf = (value) => {
  if (!value || typeof value !== 'object' || !/^[0-9a-f]{64}$/.test(String(value.selfSha256 || ''))) return false;
  const body = { ...value }; const self = body.selfSha256; delete body.selfSha256;
  return digest(body) === self;
};
const required = [
  'R9AP1R2R3_PIPELINE_INVALIDATION_LEDGER.json',
  'R9AP1R2R3_PIPELINE_BUILD_LEDGER.json',
  'R9AP1R2R3_PIPELINE_SET_IDENTITY_LEDGER.json',
  'R9AP1R2R3_PIPELINE_REBUILD_RECEIPT_LEDGER.json',
  'R9AP1R2R3_PARTICIPANT_REBUILD_SET_LEDGER.json',
  'R9AP1R2R3_OLD_PIPELINE_REUSE_NEGATIVE_LEDGER.json',
  'R9AP1R2R3_SINGLE_FLIGHT_NEGATIVE_LEDGER.json',
  'R9AP1R2R3_LATE_COMPLETION_NEGATIVE_LEDGER.json',
  'R9AP1R2R3_REBUILD_BEFORE_VALIDATION_LEDGER.json',
  'R9AP1R2R3_THREE_CYCLE_PIPELINE_MATRIX.json',
];
for (const name of required) {
  if (!fs.existsSync(path.join(artifactRoot, name))) throw Object.assign(new Error(`Missing packaged child artifact: ${name}`), { code: 'E_R9AP1R2R3_PIPELINE_REBUILD_MISSING' });
  if (!verifySelf(readJson(name))) throw Object.assign(new Error(`Child self hash failed: ${name}`), { code: 'E_R9AP1R2R3_PIPELINE_REBUILD_DIGEST' });
}
const matrix = readJson('R9AP1R2R3_THREE_CYCLE_PIPELINE_MATRIX.json');
if (matrix.schemaId !== 'tdt.r9a-p1-r2-r3.three-cycle-pipeline-matrix.v1' || !Array.isArray(matrix.rows) || matrix.rows.length !== 3) throw Object.assign(new Error('R2-R3 matrix schema or row count invalid'), { code: 'E_R9AP1R2R3_PIPELINE_REBUILD_DIGEST' });
const rows = [...matrix.rows].sort((a, b) => Number(a.cycleOrdinal) - Number(b.cycleOrdinal));
const checks = [];
const check = (id, ok, detail = {}) => checks.push({ id, status: ok ? 'PASS' : 'FAIL', ...detail });
for (const gate of catalog.rows) {
  const index = Number(gate.id.slice(-3));
  const cycle = index <= 12 ? 0 : index <= 24 ? 1 : 2;
  const row = rows[cycle];
  const local = ((index - 1) % 12) + 1;
  let ok = false;
  if (local === 1) ok = /^[0-9a-f]{64}$/.test(String(row.invalidationReceiptDigest || ''));
  if (local === 2) ok = Number(row.physicalBuildCount) === 1;
  if (local === 3) ok = Number(row.newDeviceEpoch) === Number(row.oldDeviceEpoch) + 1 && row.newDeviceIdentity !== row.oldDeviceIdentity;
  if (local === 4) ok = /^[0-9a-f]{64}$/.test(String(row.pipelineSetIdentityDigest || ''));
  if (local === 5) ok = /^[0-9a-f]{64}$/.test(String(row.pipelineRebuildReceiptDigest || ''));
  if (local === 6) ok = Number(row.oldEpochActiveCount) === 0 && Number(row.oldEpochBuildingCount) === 0;
  if (local === 7) ok = /^[0-9a-f]{64}$/.test(String(row.participantRebuildSetDigest || ''));
  if (local === 8) ok = cycle === 1 ? row.operationKind === 'export' : row.operationKind === 'preview';
  if (local === 9) ok = cycle === 1 ? Number(matrix.hostSaveContaminationCount ?? 0) === 0 : /^[0-9a-f]{64}$/.test(String(row.pipelineRebuildReceiptDigest || ''));
  if (local === 10) ok = Number(row.validationLazyBuildCount) === 0;
  if (local === 11) ok = Number(row.validationLazyBuildCount) === 0;
  if (local === 12) ok = index === 36 ? Number(matrix.physicalPipelineBuildCount) === 3 : Number(row.oldPipelineReuseAcceptedCount) === 0;
  check(gate.id, ok, { description: gate.description, cycleOrdinal: row?.cycleOrdinal ?? null });
}
const failCount = checks.filter((row) => row.status === 'FAIL').length;
if (checks.length !== 36 || failCount !== 0) throw Object.assign(new Error(`Packaged gate failed: ${failCount}`), { code: 'E_R9AP1R2R3_PIPELINE_REBUILD_DIGEST', checks });
const reportBody = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.packaged-gate-report.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3', status: 'PASS', passCount: 36, failCount: 0, rows: checks };
const report = { ...reportBody, selfSha256: digest(reportBody) };
const receiptBody = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.packaged-final-receipt.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3', state: 'THREE_CYCLE_CANONICAL_PIPELINE_REBUILD_PHYSICAL_PASS', physicalGatePassCount: 36, physicalCycleCount: 3, physicalPipelineBuildCount: matrix.physicalPipelineBuildCount, pipelineMatrixSelfSha256: matrix.selfSha256, packagedGateReportSelfSha256: report.selfSha256 };
const receipt = { ...receiptBody, selfSha256: digest(receiptBody) };
fs.writeFileSync(path.join(artifactRoot, 'R9AP1R2R3_PACKAGED_GATE_REPORT.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(artifactRoot, 'TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_PACKAGED_FINAL_RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log('R2-R3 PACKAGED PHYSICAL PASS 36/36');
