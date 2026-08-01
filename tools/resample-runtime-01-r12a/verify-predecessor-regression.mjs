import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { check, sourceArtifact, seal, sha256Bytes, verifySelf } from './lib.mjs';
const source = path.resolve('tools/resample-runtime-01-r12a/predecessor-parent-snapshot');
const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'r12a-predecessor-'));
try {
  fs.cpSync(source, isolated, { recursive: true, force: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(isolated, 'snapshot-manifest.json'), 'utf8'));
  for (const file of manifest.files) {
    const bytes = fs.readFileSync(path.join(isolated, file.path));
    check(sha256Bytes(bytes) === file.sha256 && bytes.length === file.size, 'E_R12A_PARENT_OR_LINEAGE_INVALID', `isolated predecessor snapshot mismatch: ${file.path}`);
  }
  const r11a = JSON.parse(fs.readFileSync(path.join(isolated, 'artifacts/resample-runtime-01-r11a/source-bake/TDT_RESAMPLE_RUNTIME_01_R11A_SOURCE_FINAL_RECEIPT.json'), 'utf8'));
  const r10a = JSON.parse(fs.readFileSync(path.join(isolated, 'artifacts/resample-runtime-01-r10a/source-bake/TDT_RESAMPLE_RUNTIME_01_R10A_SOURCE_FINAL_RECEIPT.json'), 'utf8'));
  check(verifySelf(r11a) && r11a.counts.PASS === 332 && r11a.counts.PENDING === 400 && r11a.counts.FAIL === 0, 'E_R12A_PARENT_OR_LINEAGE_INVALID', 'isolated R11A predecessor receipt invalid');
  check(verifySelf(r10a) && r10a.counts.PASS === 260 && r10a.counts.PENDING === 300 && r10a.counts.FAIL === 0, 'E_R12A_PARENT_OR_LINEAGE_INVALID', 'isolated R10A predecessor receipt invalid');
  const pointerA = fs.readFileSync(path.join(isolated, 'artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json'));
  const pointerB = fs.readFileSync(path.join(isolated, 'artifacts/promotion/TDT_EXPORT_PROMOTION_POINTER_V2.json'));
  check(sha256Bytes(pointerA) === sha256Bytes(pointerB), 'E_R12A_PRODUCTION_POINTER_WRITE_ATTEMPT', 'isolated predecessor pointer mirrors differ');
  sourceArtifact('R12A_PREDECESSOR_REGRESSION_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, isolatedSnapshotVerification: true, predecessorOrder: ['TDT-RESAMPLE-RUNTIME-01-R10A','TDT-RESAMPLE-RUNTIME-01-R11A'], r10aSourcePass: 260, r10aReleasePending: 300, r11aSourcePass: 332, r11aInstalledPending: 400, fail: 0, predecessorTreeMutated: false, historicalReceiptMutationCount: 0 }));
  console.log('PASS R12A isolated R11A/R10A predecessor snapshot regression 2/2');
} finally { fs.rmSync(isolated, { recursive: true, force: true }); }
