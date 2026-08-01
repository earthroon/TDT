import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { check, sourceArtifact, seal } from './lib.mjs';

const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'r11a-r10a-regression-'));
try {
  fs.cpSync(process.cwd(), isolatedRoot, {
    recursive: true,
    force: true,
    filter(source) {
      const relative = path.relative(process.cwd(), source).split(path.sep).join('/');
      return relative !== '.git' && !relative.startsWith('.git/') && relative !== 'patches' && !relative.startsWith('patches/');
    },
  });
  const run = spawnSync(process.execPath, ['tools/resample-runtime-01-r10a/run.mjs'], { cwd: isolatedRoot, encoding: 'utf8', env: { ...process.env } });
  check(run.status === 0, 'E_R11A_PREDECESSOR_REGRESSION_FAILED', 'R10A predecessor source regression failed', { status: run.status, stdout: run.stdout.slice(-4000), stderr: run.stderr.slice(-4000) });
  check(run.stdout.includes('260 SOURCE PASS / 300 RELEASE PENDING / 0 FAIL'), 'E_R11A_PREDECESSOR_REGRESSION_FAILED', 'R10A predecessor terminal state missing');
  sourceArtifact('R11A_PREDECESSOR_REGRESSION_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, predecessor: 'TDT-RESAMPLE-RUNTIME-01-R10A', isolatedRun: true, predecessorTreeMutated: false, terminalStateObserved: true, sourcePass: 260, releasePending: 300, fail: 0 }));
  console.log('PASS R11A isolated R10A predecessor source regression including R1A-R9A 1/1');
} finally {
  fs.rmSync(isolatedRoot, { recursive: true, force: true });
}
