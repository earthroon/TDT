import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const manifest = JSON.parse(fs.readFileSync('app/src/legacy/generated-legacy-manifest.json', 'utf8'));
const failures = []; const ids = new Set(); const paths = new Set();
const mainEntry = manifest.entries.find((entry) => entry.id === 'dadum.legacy.main.js');
if (!mainEntry) failures.push('missing dadum.legacy.main.js manifest entry');
else if (!mainEntry.declaredGlobalWrites.includes('ΔKCore')) failures.push('main.js static import graph global ΔKCore is not declared');
const inline01 = manifest.entries.find((entry) => entry.id === 'dadum.legacy.index-inline-01.mjs');
if (!inline01) failures.push('missing dadum.legacy.index-inline-01.mjs manifest entry');
else {
  if (!inline01.declaredGlobalWrites.includes('__ΔK_webpLazyInit')) failures.push('index-inline-01 Unicode global __ΔK_webpLazyInit is not declared');
  if (inline01.declaredGlobalWrites.includes('__')) failures.push('index-inline-01 contains truncated Unicode global prefix __');
  if (inline01.globalWriteScope !== 'static-module-graph') failures.push('index-inline-01 global write scope is not static-module-graph');
}
if (manifest.globalRegistryPolicy !== 'inventory-only') failures.push('globalRegistry must be inventory-only');
for (const entry of manifest.entries) {
  if (ids.has(entry.id)) failures.push(`duplicate legacy id ${entry.id}`); ids.add(entry.id);
  if (paths.has(entry.path)) failures.push(`duplicate legacy path ${entry.path}`); paths.add(entry.path);
  const filePath = path.join('app/legacy-runtime', entry.path);
  if (!fs.existsSync(filePath)) { failures.push(`missing legacy file ${entry.path}`); continue; }
  if (entry.status === 'active') {
    const check = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
    if (check.status !== 0) failures.push(`syntax failure ${entry.path}: ${check.stderr.trim()}`);
  }
  if (!Array.isArray(entry.declaredGlobalWrites)) failures.push(`global write declaration missing ${entry.path}`);
}
const executableFiles = [];
const walk = (dir) => { for (const item of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, item.name); if (item.isDirectory()) walk(p); else if (/\.(?:js|mjs|cjs)$/.test(item.name)) executableFiles.push(p); } };
walk('app/legacy-runtime');
for (const file of executableFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (/['"`]\/?app\//.test(source) || /['"`]\.\/app\//.test(source)) failures.push(`forbidden /app path dialect in ${file}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`PASS GATE-R1-11 legacy admission; ${manifest.entries.length} root scripts admitted, Unicode globals exact, per-module ownership active, syntax clean, no /app path dialect`);
