import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'resample-runtime-01-r1a', 'source-bake');
export const PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R1A';
export function ensureDir(dir = ARTIFACT_DIR) { fs.mkdirSync(dir, { recursive: true }); }
export function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
export function sha256File(relative) { return sha256(fs.readFileSync(path.join(ROOT, relative))); }
export function writeJson(name, value) { ensureDir(); fs.writeFileSync(path.join(ARTIFACT_DIR, name), `${JSON.stringify(value, null, 2)}\n`); }
export function read(relative) { return fs.readFileSync(path.join(ROOT, relative), 'utf8'); }
export function walk(relative) {
  const base = path.join(ROOT, relative); const out = [];
  const visit = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) { const abs=path.join(dir,entry.name); if(entry.isDirectory()) visit(abs); else if(entry.isFile()) out.push(path.relative(ROOT,abs).replaceAll('\\','/')); } };
  if (fs.existsSync(base)) visit(base); return out;
}
export function check(condition, id, message, detail = null) { return { id, pass: Boolean(condition), message, detail }; }
