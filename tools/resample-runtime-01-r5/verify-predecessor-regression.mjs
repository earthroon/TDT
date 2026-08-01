import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, writeJson } from './lib.mjs';

const names = [
  'resample-runtime-01-r1a',
  'resample-runtime-01-r1b',
  'resample-runtime-01-r1c',
  'resample-runtime-01-r1d',
  'resample-runtime-01-r2',
  'resample-runtime-01-r3',
  'resample-runtime-01-r4',
];

const protectedRels = [];
for (const name of names) {
  protectedRels.push(`artifacts/${name}`, `fixtures/${name}`);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tdt-r5-regression-snapshot-'));
const snapshots = protectedRels.map((rel, index) => {
  const src = path.join(ROOT, rel);
  const dst = path.join(tempRoot, String(index));
  const existed = fs.existsSync(src);
  if (existed) fs.cpSync(src, dst, { recursive: true, preserveTimestamps: true });
  return { rel, src, dst, existed };
});

function restoreProtected() {
  for (const snapshot of snapshots) {
    fs.rmSync(snapshot.src, { recursive: true, force: true });
    if (snapshot.existed && fs.existsSync(snapshot.dst)) {
      fs.mkdirSync(path.dirname(snapshot.src), { recursive: true });
      fs.cpSync(snapshot.dst, snapshot.src, { recursive: true, preserveTimestamps: true });
    }
  }
}

const rows = [];
let failed = false;
try {
  for (const name of names) {
    const result = spawnSync('npm', ['run', `verify:${name}`], {
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, TERM: 'dumb' },
    });

    rows.push({
      name,
      pass: result.status === 0,
      status: result.status,
      tail: `${result.stdout}${result.stderr}`.split(/\r?\n/).slice(-12),
    });

    // Every predecessor verifier may rewrite evidence owned by any earlier patch.
    // Restore the complete R1A-R4 evidence surface before the next verifier runs.
    restoreProtected();

    if (result.status !== 0) {
      console.error(result.stdout, result.stderr);
      failed = true;
      break;
    }
  }
} finally {
  restoreProtected();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

writeJson('TDT_RESAMPLE_RUNTIME_01_R5_PREDECESSOR_REGRESSION_RECEIPT.json', {
  schemaVersion: 3,
  pass: !failed,
  rows,
  historicalEvidenceRestored: true,
  restoreScope: 'all-r1a-through-r4-artifacts-and-fixtures-after-each-run',
  protectedDirectoryCount: protectedRels.length,
});

if (failed) process.exit(1);
console.log(`PASS R5 predecessor regression ${rows.length}/${names.length} with isolated historical evidence restoration`);
