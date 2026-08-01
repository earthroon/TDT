import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { PATCH_ID, projectRoot, writeCanonicalReceipt } from './lib.mjs';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const files = [
  'app/src/boot/runtime-modules.ts',
  'app/src/legacy/legacy-runtime-adapter.ts',
  'app/src/runtime/active-graph/active-graph-service.ts',
  'app/src/runtime/assets/runtime-asset-authority.ts',
  'app/src/runtime/side-effects/side-effect-registry.ts',
  'app/src/runtime/sequence/deterministic-sequence-service.ts',
  'app/src/runtime/workers/encoder-worker-broker-service.ts',
  'app/src/runtime/service-token.ts',
];
const records = [];
for (const relative of files) {
  const source = fs.readFileSync(path.join(projectRoot, relative), 'utf8');
  const result = ts.transpileModule(source, {
    fileName: relative,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true, resolveJsonModule: true },
  });
  const errors = (result.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error).map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n'));
  records.push({ sourceRelative: relative, status: errors.length ? 'FAIL' : 'PASS', errors });
}
const receipt = writeCanonicalReceipt('artifacts/active-graph-01/source-bake/typescript-transpile-receipt.json', { schemaVersion: 1, patchId: PATCH_ID, status: records.every((record) => record.status === 'PASS') ? 'PASS' : 'FAIL', records });
if (receipt.status !== 'PASS') { console.error(JSON.stringify(receipt, null, 2)); process.exit(1); }
console.log(`ACTIVE_GRAPH TypeScript transpile ${records.length}/${records.length}`);
