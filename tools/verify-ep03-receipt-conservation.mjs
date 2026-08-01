import fs from 'node:fs';
import path from 'node:path';
import { sha256File } from './ep03-promotion-lib.mjs';
const root = path.resolve('artifacts/promotion');
const file = path.join(root, 'TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT.json');
const receipt = JSON.parse(fs.readFileSync(file, 'utf8'));
let ok = true;
for (const record of receipt.formatReceipts || []) {
  const candidate = path.join(root, record.filename);
  const digest = fs.existsSync(candidate) ? sha256File(candidate) : null;
  if (digest !== record.sha256) { ok = false; console.error(`FAIL ${record.reportId} digest`); }
}
if (receipt.status === 'PASS' && receipt.receiptConservationVerified !== true) ok = false;
if (!ok) throw new Error('E_PROMOTION_RECEIPT_CONSERVATION_FAILED');
console.log(`PASS EP03 receipt references conserved; promotionStatus=${receipt.status}`);
