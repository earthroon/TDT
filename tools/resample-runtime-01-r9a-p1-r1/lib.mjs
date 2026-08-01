import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT = process.cwd();
export const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r1/source-bake');
export const PACKAGED_OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r1/packaged');
export function check(value, code, message, detail = null) { if (!value) throw Object.assign(new Error(message), { code, detail }); return value; }
export function read(relative) { return fs.readFileSync(path.join(ROOT, relative), 'utf8'); }
export function json(relative) { return JSON.parse(read(relative)); }
export function exists(relative) { return fs.existsSync(path.join(ROOT, relative)); }
export function sha256Bytes(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
export function sha256File(relative) { return sha256Bytes(fs.readFileSync(path.join(ROOT, relative))); }
export function canonical(value) { if (Array.isArray(value)) return value.map(canonical); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])); if (typeof value === 'number') check(Number.isFinite(value), 'E_R9AP1R1_NONFINITE', 'nonfinite number'); return Object.is(value, -0) ? 0 : value; }
export function canonicalJson(value) { return `${JSON.stringify(canonical(value), null, 2)}\n`; }
export function digestCanonical(value) { return sha256Bytes(canonicalJson(value)); }
export function seal(value, field = 'selfSha256') { const body = { ...value }; delete body[field]; return Object.freeze({ ...canonical(body), [field]: digestCanonical(body) }); }
export function verifySelf(value, field = 'selfSha256') { if (!value || typeof value[field] !== 'string') return false; const body = { ...value }; const expected = body[field]; delete body[field]; return expected === digestCanonical(body); }
export function ensureDir(directory) { fs.mkdirSync(directory, { recursive: true }); return directory; }
export function atomicWrite(file, data) { ensureDir(path.dirname(file)); const temp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`; const fd = fs.openSync(temp, 'wx'); try { fs.writeFileSync(fd, data); fs.fsyncSync(fd); } finally { fs.closeSync(fd); } fs.renameSync(temp, file); try { const dfd = fs.openSync(path.dirname(file), 'r'); try { fs.fsyncSync(dfd); } finally { fs.closeSync(dfd); } } catch {} }
export function sourceArtifact(name, value) { atomicWrite(path.join(OUT, name), canonicalJson(value)); return value; }
export function capture(id, fn) { try { return { id, status: 'PASS', evidence: fn() ?? true }; } catch (error) { return { id, status: 'FAIL', errorCode: String(error?.code || 'E_R9AP1R1_SOURCE_FAILURE'), message: String(error?.message || error), detail: error?.detail ?? null }; } }
export async function captureAsync(id, fn) { try { return { id, status: 'PASS', evidence: (await fn()) ?? true }; } catch (error) { return { id, status: 'FAIL', errorCode: String(error?.code || 'E_R9AP1R1_SOURCE_FAILURE'), message: String(error?.message || error), detail: error?.detail ?? null }; } }
export function expectError(code, fn) { try { fn(); } catch (error) { check(error?.code === code, 'E_R9AP1R1_NEGATIVE_WRONG_CODE', 'unexpected error code', { expected: code, actual: error?.code }); return true; } throw Object.assign(new Error('negative control did not fail'), { code: 'E_R9AP1R1_NEGATIVE_DID_NOT_FAIL', detail: { expected: code } }); }
export function walk(rootDir) { const out = []; if (!fs.existsSync(rootDir)) return out; const queue = [rootDir]; while (queue.length) { const directory = queue.pop(); for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name))) { const absolute = path.join(directory, entry.name); if (entry.isDirectory()) queue.push(absolute); else out.push(absolute); } } return out.sort(); }
