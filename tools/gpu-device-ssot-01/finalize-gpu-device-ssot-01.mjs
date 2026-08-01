import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, ARTIFACT_DIR, sha256, writeJson } from './lib.mjs';

const gatePath = path.join(ARTIFACT_DIR, 'TDT_GPU_DEVICE_SSOT_01_SOURCE_GATE.json');
const changedPath = path.join(ROOT, 'tools/gpu-device-ssot-01/changed-files.json');
if (!fs.existsSync(gatePath)) throw new Error('E_GPU_SOURCE_GATE_MISSING');
if (!fs.existsSync(changedPath)) throw new Error('E_GPU_CHANGED_FILE_LIST_MISSING');

const gate = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
const changed = JSON.parse(fs.readFileSync(changedPath, 'utf8'));
const files = [];
for (const item of changed.files ?? []) {
  const relative = String(item.relative);
  const full = path.join(ROOT, relative);
  if (item.status === 'deleted') {
    if (fs.existsSync(full)) throw new Error(`E_GPU_EXPECTED_DELETION_PRESENT:${relative}`);
    files.push({ relative, status: 'deleted', sha256: null, byteLength: 0 });
    continue;
  }
  if (!fs.existsSync(full)) throw new Error(`E_GPU_CHANGED_FILE_MISSING:${relative}`);
  const bytes = fs.readFileSync(full);
  files.push({ relative, status: item.status, sha256: sha256(bytes), byteLength: bytes.byteLength });
}

const payload = {
  schemaVersion: 1,
  patchId: 'TDT-GPU-DEVICE-SSOT-01',
  state: gate.state,
  gateCounts: gate.counts,
  productionPointerMutated: false,
  packagedClaims: false,
  changedFileCount: files.length,
  files,
};
const seal = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
writeJson('TDT_GPU_DEVICE_SSOT_01_SOURCE_RECEIPT.json', { ...payload, sourceSealSha256: seal });
console.log(`PASS finalized GPU DEVICE SSOT source receipt files=${files.length} seal=${seal}`);
