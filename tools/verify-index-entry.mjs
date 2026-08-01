import fs from 'node:fs';
const html = fs.readFileSync('app/index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const executable = scripts.filter((match) => !/type\s*=\s*["'](?:x-shader|application\/json|application\/ld\+json)/i.test(match[1]));
const failures = [];
if (executable.length !== 1) failures.push(`expected 1 executable script, found ${executable.length}`);
const attrs = executable[0]?.[1] ?? '';
if (!/type\s*=\s*["']module["']/i.test(attrs) || !/src\s*=\s*["']\/src\/main\.ts["']/i.test(attrs)) failures.push('authoritative entry must be /src/main.ts module');
if ((executable[0]?.[2] ?? '').trim()) failures.push('authoritative entry script must not contain inline code');
if (/\/app\//.test(html)) failures.push('index contains forbidden /app/ path dialect');
const electron = fs.readFileSync('electron.mjs', 'utf8');
if (!/dist['"],\s*['"]renderer/.test(electron)) failures.push('electron renderer root is not dist/renderer');
if (/replace\(\/\^app\\\//.test(electron)) failures.push('electron still rewrites /app/ paths');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('PASS GATE-R1-01 Vite entry closure; GATE-R1-02 production source serving closure');
