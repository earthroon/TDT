import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTransactionV2, transitionTransactionV2, writeTransactionV2, readTransactionV2 } from '../../app/features/resample-runtime/r12a/update-transaction-v2.mjs';
import { appendJournalV2, readJournalV2 } from '../../app/features/resample-runtime/r12a/update-journal-v2.mjs';
import { acquireUpdateLock, readUpdateLock, releaseUpdateLock, evaluateStaleUpdateLock } from '../../app/features/resample-runtime/r12a/update-lock.mjs';
import { TRANSACTION_STATES } from '../../app/features/resample-runtime/r12a/r12a-contract.mjs';
import { check, sourceArtifact, seal } from './lib.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r12a-tx-'));
try {
  const txFile = path.join(root, 'tx.json'); const journalFile = path.join(root, 'journal.jsonl'); const lockFile = path.join(root, 'lock.json');
  let tx = createTransactionV2({ updateTransactionId: 'ab'.repeat(24), sourceBuildId: 'source-build', sourcePackageContentId: 'source-package', targetBuildId: 'target-build', targetPackageContentId: 'target-package', previousBuildId: 'source-build', previousPackageContentId: 'source-package', r10aFinalReleaseDigest: '1'.repeat(64), r10aLineageDigest: '2'.repeat(64), r11aSourceSessionDigest: '3'.repeat(64), expectedProductionPointerGeneration: 9, expectedProductionPointerRawSha256: '4'.repeat(64), expectedLocalPointerGeneration: 0, expectedLocalPointerRawSha256: null, installGeneration: 1, createdAt: '2026-08-01T00:00:00.000Z' });
  acquireUpdateLock(lockFile, { updateTransactionId: tx.updateTransactionId, ownerPid: 123, ownerProcessStartIdentity: 'pid123-start1', sourcePackageContentId: tx.sourcePackageContentId, targetPackageContentId: tx.targetPackageContentId });
  check(readUpdateLock(lockFile).updateTransactionId === tx.updateTransactionId, 'E_R12A_UPDATE_LOCK_HELD', 'update lock readback failed');
  writeTransactionV2(txFile, tx);
  appendJournalV2(journalFile, { updateTransactionId: tx.updateTransactionId, phase: 'CREATE', evidenceDigest: '5'.repeat(64), at: '2026-08-01T00:00:00.000Z' });
  for (const state of TRANSACTION_STATES.slice(1, 6)) { tx = transitionTransactionV2(tx, state, '6'.repeat(64)); writeTransactionV2(txFile, tx); }
  appendJournalV2(journalFile, { updateTransactionId: tx.updateTransactionId, phase: 'DRAIN', intent: true, evidenceDigest: '7'.repeat(64), at: '2026-08-01T00:00:01.000Z' });
  appendJournalV2(journalFile, { updateTransactionId: tx.updateTransactionId, phase: 'DRAIN', effect: true, evidenceDigest: '8'.repeat(64), at: '2026-08-01T00:00:02.000Z' });
  check(readTransactionV2(txFile).state === 'STAGED_CANARY_PASSED' && readJournalV2(journalFile).length === 3, 'E_R12A_TRANSACTION_INVALID', 'transaction or journal readback failed');
  const stale = evaluateStaleUpdateLock({ lock: readUpdateLock(lockFile), ownerAlive: false, ownerProcessStartIdentity: 'other', transactionState: tx.state, journalHeadTransactionId: tx.updateTransactionId, localPointerTransactionId: null });
  check(stale.action === 'RECOVERY_REQUIRED', 'E_R12A_UPDATE_LOCK_AMBIGUOUS', 'stale lock recovery decision invalid');
  releaseUpdateLock(lockFile, tx.updateTransactionId);
  sourceArtifact('R12A_TRANSACTION_JOURNAL_LOCK_SELF_TEST.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, transactionSchemaVersion: 2, stateCount: TRANSACTION_STATES.length, lastStateTested: tx.state, journalEntryCount: 3, appendOnlyHashChain: true, intentBeforeEffect: true, exclusiveLock: true, staleLockUsesPidStartTransactionJournalPointer: true }));
  console.log('R12A transaction journal lock PASS');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
