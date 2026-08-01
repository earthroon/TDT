import fs from 'node:fs';
import path from 'node:path';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';
import { check, sourceArtifact, seal } from './lib.mjs';
const files = [
  'app/src/runtime/update/runtime-update-service.ts','app/src/runtime/admission/installed-admission-service.ts','app/src/runtime/service-token.ts','app/src/env.d.ts','app/src/boot/runtime-modules.ts','app/src/boot/bootstrap-renderer.ts','app/src/runtime/preview/preview-presenter-service.ts','app/src/runtime/export/export-authority-service.ts'
];
const results = [];
for (const file of files) {
  const text = fs.readFileSync(path.resolve(file), 'utf8');
  let diagnostics = []; let outputBytes = 0;
  if (file.endsWith('.d.ts')) { const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS); diagnostics = source.parseDiagnostics || []; }
  else { const output = ts.transpileModule(text, { fileName: file, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, isolatedModules: true, useDefineForClassFields: true, resolveJsonModule: true } }); diagnostics = output.diagnostics || []; outputBytes = output.outputText.length; }
  const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error).map((diagnostic) => ({ code: diagnostic.code, message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n') }));
  check(errors.length === 0, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `TypeScript syntax failed: ${file}`, errors);
  results.push({ file, outputBytes, diagnostics: 0 });
}
sourceArtifact('R12A_TYPESCRIPT_SYNTAX_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, files: results }));
console.log(`R12A TypeScript syntax PASS ${results.length}/${results.length}`);
