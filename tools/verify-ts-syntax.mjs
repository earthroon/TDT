import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const ts = require(path.join(globalRoot, 'typescript', 'lib', 'typescript.js'));
const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile() && (file.endsWith('.ts') || file.endsWith('.vue'))) files.push(file);
  }
};
walk('app/src');
let failed = false;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const blocks = file.endsWith('.vue')
    ? [...source.matchAll(/<script\b[^>]*lang=["']ts["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
    : [source];
  blocks.forEach((block, index) => {
    const unit = ts.createSourceFile(`${file}#${index}`, block, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
    for (const diagnostic of unit.parseDiagnostics ?? []) {
      failed = true;
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(`${file}: ${message}`);
    }
  });
}
if (failed) process.exit(1);
console.log(`PASS TypeScript syntax ${files.length} files`);
