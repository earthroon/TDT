import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, readJson, writeArtifact } from './lib.mjs';

const snapshotRoot = path.join(ROOT, 'tools/resample-runtime-01-r6/predecessor-parent-snapshot');
const snapshotManifest = readJson('tools/resample-runtime-01-r6/predecessor-parent-snapshot/snapshot-manifest.json');
const expectedParent = '6b6d7e403d4d289c43c28956b74df5c272da7138055fd180df671a5a5298fa63';
if (snapshotManifest.sourceParentZipSha256 !== expectedParent) throw new Error('E_R6_PREDECESSOR_SNAPSHOT_PARENT_MISMATCH');

function overlaySnapshot(targetRoot) {
  for (const relative of snapshotManifest.files) {
    const source = path.join(snapshotRoot, relative);
    const target = path.join(targetRoot, relative);
    if (!fs.existsSync(source)) throw new Error(`E_R6_PREDECESSOR_SNAPSHOT_FILE_MISSING:${relative}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

const names = [
  'resample-runtime-01-r1a',
  'resample-runtime-01-r1b',
  'resample-runtime-01-r1c',
  'resample-runtime-01-r1d',
  'resample-runtime-01-r2',
  'resample-runtime-01-r3',
  'resample-runtime-01-r4',
  'resample-runtime-01-r5',
];
const rows = [];
for (const name of names) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), `tdt-r6-${name}-`));
  try {
    fs.cpSync(ROOT, temp, { recursive: true });
    overlaySnapshot(temp);
    const result = spawnSync('npm', ['run', `verify:${name}`], { cwd: temp, stdio: 'pipe', encoding: 'utf8' });
    rows.push({
      name,
      pass: result.status === 0,
      status: result.status,
      tail: `${result.stdout ?? ''}${result.stderr ?? ''}`.split(/\r?\n/).slice(-12),
    });
    if (result.status !== 0) {
      writeArtifact('TDT_RESAMPLE_RUNTIME_01_R6_PREDECESSOR_REGRESSION_RECEIPT.json', {
        schemaVersion: 1,
        patchId: 'TDT-RESAMPLE-RUNTIME-01-R6',
        pass: false,
        snapshotParentZipSha256: expectedParent,
        snapshotFileCount: snapshotManifest.fileCount,
        rows,
      });
      console.error(result.stdout, result.stderr);
      process.exit(1);
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
writeArtifact('TDT_RESAMPLE_RUNTIME_01_R6_PREDECESSOR_REGRESSION_RECEIPT.json', {
  schemaVersion: 1,
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R6',
  pass: true,
  snapshotParentZipSha256: expectedParent,
  snapshotFileCount: snapshotManifest.fileCount,
  rows,
});
console.log(`PASS R6 predecessor regression ${rows.length}/${rows.length}`);
