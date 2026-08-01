import fs from 'node:fs';
import path from 'node:path';
import { blockedReport, writeJson } from './ep03-promotion-lib.mjs';
const pointerFile = path.resolve(process.argv[2] || 'artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json');
const pointer = JSON.parse(fs.readFileSync(pointerFile, 'utf8'));
const blockers = [];
if (!pointer.previousBuildId || !pointer.previousPackageContentId) blockers.push('no-previous-promoted-package');
if (pointer.rollbackUnit !== 'whole-build-only') blockers.push('rollback-unit-not-whole-build');
if (pointer.legacyFallbackAllowed !== false || pointer.perEncoderRollbackAllowed !== false) blockers.push('forbidden-rollback-fallback-enabled');
blockers.push('previous-package-relaunch-not-run');
blockers.push('rollback-export-save-decode-smoke-not-run');
const report = blockedReport('TDT_EXPORT_PROMOTION_03_ROLLBACK_DRILL_RECEIPT', blockers, {
  triggerReceiptDigest: null,
  previousBuildId: pointer.previousBuildId || null,
  previousPackageContentId: pointer.previousPackageContentId || null,
  rollbackUnit: pointer.rollbackUnit,
  previousPackageRelaunched: false,
  healthVerified: false,
  exportSaveDecodeSmokeVerified: false,
  legacyFallbackUsed: false,
  perEncoderRollbackUsed: false,
});
writeJson('artifacts/promotion/TDT_EXPORT_PROMOTION_03_ROLLBACK_DRILL_RECEIPT.json', report);
console.log(`${report.status} rollback drill; blockers=${report.blockers.length}`);
