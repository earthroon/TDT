import fs from 'node:fs';
import path from 'node:path';
const root = 'app/src/stores';
const forbidden = [/\bGPU(?:Device|Texture|Buffer|Queue|Adapter)\b/, /\bWorker\b/, /\bMessagePort\b/, /\bBlob\b/, /\bFile\b/, /\bImageBitmap\b/, /\bImageData\b/, /\bHTMLCanvasElement\b/, /\bOffscreenCanvas\b/, /\bWebAssembly\.(?:Instance|Module)\b/];
const allow = new Set(['serializable.ts']);
const failures = [];
for (const name of fs.readdirSync(root).filter((name) => name.endsWith('.ts'))) {
  if (allow.has(name)) continue;
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  for (const pattern of forbidden) if (pattern.test(source)) failures.push(`${name}: forbidden runtime type ${pattern}`);
  const executableSource = source.replace(/^\s*(?:import|export\s+\{).*$/gm, '');
  if (/\b(?:window|document|navigator)\s*\./.test(executableSource)) failures.push(`${name}: store accesses host/runtime global`);
}
const guard = fs.readFileSync(path.join(root, 'serializable.ts'), 'utf8');
if (!guard.includes('E_PINIA_NON_SERIALIZABLE')) failures.push('serializable runtime guard missing stable error');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('PASS GATE-R1-08 Pinia static serializability gate');
