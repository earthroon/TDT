import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, SPEC_ID, assert, seal, writeJsonAtomic } from './lib.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const files = [
  'app/src/runtime/promotion/promotion-baseline-00-harness.ts',
  'app/src/runtime/workers/encoder-worker-types.ts',
  'app/src/runtime/workers/encoder-worker-broker-service.ts',
  'app/src/runtime/export/export-authority-service.ts',
  'app/src/boot/bootstrap-renderer.ts',
];
const records = [];
for (const relative of files) {
  const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  const result = ts.transpileModule(source, {
    fileName: relative,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, strict: true },
  });
  const errors = (result.diagnostics ?? [])
    .filter((item) => item.category === ts.DiagnosticCategory.Error)
    .map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n'));
  records.push({ path: relative, status: errors.length ? 'FAIL' : 'PASS', errors });
}
assert(records.every((record) => record.status === 'PASS'), 'P0_SOURCE_TYPESCRIPT_TRANSPILE_FAILED', { records });
const receipt = seal({ schemaVersion: 1, specId: SPEC_ID, status: 'PASS', state: 'SOURCE_TYPESCRIPT_TRANSPILE_VERIFIED', records, createdAt: new Date().toISOString() });
writeJsonAtomic(path.join(ROOT, 'artifacts/promotion-baseline-00/receipts/typescript-transpile-report.json'), receipt);
console.log(`PASS ${SPEC_ID} TypeScript transpile ${records.length}/${records.length}`);
