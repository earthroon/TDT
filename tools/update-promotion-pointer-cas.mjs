import fs from 'node:fs';
import path from 'node:path';
import { promotePointerCas, sha256File } from './ep03-promotion-lib.mjs';

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}
const pointerFile = path.resolve(arg('pointer') || 'artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json');
const receiptFile = path.resolve(arg('receipt') || 'artifacts/promotion/TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT.json');
const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
if (receipt.status !== 'PASS' || receipt.receiptConservationVerified !== true) throw new Error('E_PROMOTION_RECEIPT_CONSERVATION_FAILED');
const expected = arg('expected') || receipt.expectedPreviousPointerSha256;
const buildId = arg('build-id') || receipt.rendererBuildId;
const packageContentId = arg('package-content-id') || receipt.packageContentId;
const profile = arg('profile') || 'full-product-v1';
const result = promotePointerCas({
  pointerFile,
  expectedPreviousPointerSha256: expected,
  buildId,
  packageContentId,
  releaseProfileId: profile,
  promotionReceiptSha256: sha256File(receiptFile),
});
console.log(`PROMOTED ${result.activeBuildId} ${result.activeReleaseProfileId} ${result.pointerSha256}`);
