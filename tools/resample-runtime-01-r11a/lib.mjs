import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT = process.cwd();
export const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r11a/source-bake');
export function check(value, code, message, detail = null) { if (!value) throw Object.assign(new Error(message), { code, detail }); return value; }
export function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
export function json(rel) { return JSON.parse(read(rel)); }
export function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
export function sha256Bytes(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
export function sha256File(rel) { return sha256Bytes(fs.readFileSync(path.join(ROOT, rel))); }
export function canonical(value) { if (Array.isArray(value)) return value.map(canonical); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])); if (typeof value === 'number') check(Number.isFinite(value), 'E_R11A_SOURCE_RECEIPT_INVALID', 'nonfinite canonical number'); return Object.is(value, -0) ? 0 : value; }
export function canonicalJson(value) { return `${JSON.stringify(canonical(value), null, 2)}\n`; }
export function digestCanonical(value) { return sha256Bytes(canonicalJson(value)); }
export function seal(value, field = 'selfSha256') { const body = { ...value }; delete body[field]; return Object.freeze({ ...canonical(body), [field]: digestCanonical(body) }); }
export function verifySelf(value, field = 'selfSha256') { const expected = value?.[field]; const body = { ...value }; delete body[field]; return typeof expected === 'string' && expected === digestCanonical(body); }
export function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); return dir; }
export function atomicWrite(file, data) { ensureDir(path.dirname(file)); const temp = `${file}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`; const fd = fs.openSync(temp, 'wx'); try { fs.writeFileSync(fd, data); fs.fsyncSync(fd); } finally { fs.closeSync(fd); } fs.renameSync(temp, file); }
export function sourceArtifact(name, value) { ensureDir(OUT); atomicWrite(path.join(OUT, name), canonicalJson(value)); return value; }
export function capture(id, fn) { try { return { id, status: 'PASS', evidence: fn() ?? true }; } catch (error) { return { id, status: 'FAIL', errorCode: String(error?.code || 'E_R11A_SOURCE_RECEIPT_INVALID'), message: String(error?.message || error), detail: error?.detail ?? null }; } }
