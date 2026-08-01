import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, ARTIFACT_DIR, PARENT_FILES, R3_EVIDENCE, sha256File, check, writeJson } from './lib.mjs';

const checks = [];
const logLines = [];
for (const patch of ['r1a', 'r1b', 'r1c', 'r1d']) {
  const script = path.join(ROOT, `tools/resample-runtime-01-${patch}/run.mjs`);
  const result = spawnSync(process.execPath, [script], { cwd: ROOT, encoding: 'utf8' });
  checks.push(check(result.status === 0, `REG-${patch}`, `predecessor ${patch.toUpperCase()} gate rerun`));
  logLines.push(`===== ${patch.toUpperCase()} =====`, result.stdout ?? '', result.stderr ?? '', `EXIT=${result.status}`);
}

const frozenR3 = new Map(Object.keys(R3_EVIDENCE).map((relative) => [relative, fs.readFileSync(path.join(ROOT, relative))]));
let r3Result;
try {
  r3Result = spawnSync(process.execPath, [path.join(ROOT, 'tools/resample-runtime-01-r3/run.mjs')], { cwd: ROOT, encoding: 'utf8' });
} finally {
  for (const [relative, bytes] of frozenR3) fs.writeFileSync(path.join(ROOT, relative), bytes);
}
checks.push(check(r3Result?.status === 0, 'REG-r3', 'predecessor R3 gate rerun with frozen evidence restored'));
logLines.push('===== R3 =====', r3Result?.stdout ?? '', r3Result?.stderr ?? '', `EXIT=${r3Result?.status}`);
checks.push(check(
  Object.values(PARENT_FILES).every(([relative, expected]) => sha256File(relative) === expected),
  'REG-r2-frozen-assets',
  'R2 frozen product, validation, reference, profile, and parity assets remain byte-identical',
));
checks.push(check(
  Object.entries(R3_EVIDENCE).every(([relative, expected]) => sha256File(relative) === expected),
  'REG-r3-frozen-evidence',
  'R3 frozen evidence remains byte-identical after rerun',
));
const pass = checks.every((entry) => entry.pass);
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACT_DIR, 'TDT_RESAMPLE_RUNTIME_01_R4_PREDECESSOR_RERUN.log'), `${logLines.join('\n')}\n`, 'utf8');
writeJson('r4-predecessor-regression.json', { schemaVersion: 1, pass, checks });
if (!pass) {
  console.error(checks.filter((entry) => !entry.pass));
  process.exit(1);
}
console.log(`PASS R4 predecessor regression ${checks.length}/${checks.length}`);
