import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('app/src');
const stableSource = fs.readFileSync(path.join(root, 'boot/stable-error.ts'), 'utf8');
const declared = new Set([...stableSource.matchAll(/\|\s*'([A-Z0-9_]+)'/g)].map((match) => match[1]));
const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.isFile() && absolute.endsWith('.ts')) files.push(absolute);
  }
};
walk(root);
const referenced = new Map();
const patterns = [
  /['"](E_[A-Z0-9_]+)['"]/g,
];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const locations = referenced.get(match[1]) ?? [];
      locations.push(path.relative('.', file).replaceAll(path.sep, '/'));
      referenced.set(match[1], locations);
    }
  }
}
const undeclared = [...referenced.keys()].filter((code) => !declared.has(code)).sort();
if (undeclared.length) {
  for (const code of undeclared) console.error(`FAIL undeclared stable error ${code}: ${referenced.get(code).join(', ')}`);
  process.exit(1);
}
console.log(`PASS GATE-R1-ERROR-CODE stable error registry ${referenced.size}/${declared.size} referenced codes declared`);
