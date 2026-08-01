import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = process.cwd();
export const SOURCE_OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2-r1/source-bake');
export const PACKAGED_OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2/packaged');

export function check(value, code, message, detail = null) {
  if (!value) throw Object.assign(new Error(message), { code, detail });
  return value;
}

export function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

export function readJson(relative) {
  return JSON.parse(read(relative));
}

export function exists(relative) {
  return fs.existsSync(path.join(ROOT, relative));
}

export function sha256Bytes(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function sha256File(relative) {
  return sha256Bytes(fs.readFileSync(path.join(ROOT, relative)));
}

export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  if (typeof value === 'number') check(Number.isFinite(value), 'E_R9AP1R2R1_NONFINITE', 'Non-finite number is not canonical');
  return Object.is(value, -0) ? 0 : value;
}

export function canonicalJson(value) {
  return `${JSON.stringify(canonical(value), null, 2)}\n`;
}

export function digestCanonical(value) {
  return sha256Bytes(canonicalJson(value));
}

export function seal(value, field = 'selfSha256') {
  const body = { ...value };
  delete body[field];
  return Object.freeze({ ...canonical(body), [field]: digestCanonical(body) });
}

export function verifySelf(value, field = 'selfSha256') {
  if (!value || typeof value[field] !== 'string') return false;
  const body = { ...value };
  const expected = body[field];
  delete body[field];
  return expected === digestCanonical(body);
}

export function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

export function atomicWrite(file, data) {
  ensureDir(path.dirname(file));
  const temp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  const fd = fs.openSync(temp, 'wx');
  try {
    fs.writeFileSync(fd, data);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
  try {
    const directory = fs.openSync(path.dirname(file), 'r');
    try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
  } catch {}
}

export function sourceArtifact(name, value) {
  atomicWrite(path.join(SOURCE_OUT, name), canonicalJson(value));
  return value;
}

export function packagedArtifact(name, value) {
  atomicWrite(path.join(PACKAGED_OUT, name), canonicalJson(value));
  return value;
}

export function gate(id, requirement, method, fn) {
  try {
    const evidence = fn() ?? true;
    return { id, requirement, method, status: 'PASS', evidence };
  } catch (error) {
    return {
      id,
      requirement,
      method,
      status: 'FAIL',
      errorCode: String(error?.code ?? 'E_R9AP1R2R1_SOURCE_GATE'),
      message: String(error?.message ?? error),
      detail: error?.detail ?? null,
    };
  }
}

export async function gateAsync(id, requirement, method, fn) {
  try {
    const evidence = (await fn()) ?? true;
    return { id, requirement, method, status: 'PASS', evidence };
  } catch (error) {
    return {
      id,
      requirement,
      method,
      status: 'FAIL',
      errorCode: String(error?.code ?? 'E_R9AP1R2R1_SOURCE_GATE'),
      message: String(error?.message ?? error),
      detail: error?.detail ?? null,
    };
  }
}

export function occurrenceCount(text, token) {
  return text.split(token).length - 1;
}

export function indexOrder(text, tokens) {
  let previous = -1;
  const positions = [];
  for (const token of tokens) {
    const current = text.indexOf(token, previous + 1);
    check(current >= 0, 'E_R9AP1R2R1_TOKEN_MISSING', `Required token is missing: ${token}`);
    check(current > previous, 'E_R9AP1R2R1_ORDER', `Token ordering is invalid: ${token}`, { tokens, positions, current });
    positions.push(current);
    previous = current;
  }
  return positions;
}

export function walk(directory) {
  const root = path.resolve(directory);
  const output = [];
  if (!fs.existsSync(root)) return output;
  const queue = [root];
  while (queue.length) {
    const current = queue.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name))) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(absolute);
      else output.push(absolute);
    }
  }
  return output.sort();
}
