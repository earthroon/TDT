import fs from 'node:fs';
import path from 'node:path';
import { PATCH_ID, canonicalJson, listFiles, projectRoot, readJson, sha256Bytes, stableSortRecords, writeJson } from './lib.mjs';

const admission = readJson('app/src/legacy/generated-legacy-static-admission.json');
const admitted = new Set(admission.records.map((record) => record.sourceRelative));
for (const file of listFiles('app/src')) if (/\.(ts|tsx|vue|js|mjs|cjs)$/.test(file)) admitted.add(file);
for (const file of ['electron.mjs', 'preload.cjs']) admitted.add(file);
const patterns = [
  ['math-random', /\bMath\.random\s*\(/g],
  ['crypto-random-uuid', /\b(?:crypto|globalThis\.crypto)\.randomUUID\s*\(/g],
  ['crypto-get-random-values', /\b(?:crypto|globalThis\.crypto)\.getRandomValues\s*\(/g],
];
const findings = [];
for (const sourceRelative of [...admitted].sort()) {
  const absolute = path.join(projectRoot, sourceRelative);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue;
  if (/\.(wasm|node|png|jpe?g|webp|icc|icm)$/i.test(sourceRelative)) continue;
  const source = fs.readFileSync(absolute, 'utf8');
  const lines = source.split(/\r?\n/);
  for (const [kind, pattern] of patterns) {
    for (let index = 0; index < lines.length; index += 1) {
      pattern.lastIndex = 0;
      if (pattern.test(lines[index])) findings.push({ sourceRelative, line: index + 1, kind, excerpt: lines[index].trim().slice(0, 240) });
    }
  }
}
const sorted = stableSortRecords(findings, ['sourceRelative', 'line', 'kind']);
const unsigned = { schemaVersion: 1, patchId: PATCH_ID, admittedSourceCount: admitted.size, activeRandomnessSourceCount: sorted.length, findings: sorted, auditDigest: null };
const report = { ...unsigned, auditDigest: sha256Bytes(canonicalJson(unsigned)) };
writeJson('artifacts/active-graph-01/source-bake/randomness-audit.json', report);
if (sorted.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} else console.log(`ACTIVE_GRAPH randomness 0 admitted=${admitted.size} digest=${report.auditDigest}`);
