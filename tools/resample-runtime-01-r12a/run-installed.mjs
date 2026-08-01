import fs from 'node:fs';
import path from 'node:path';
import { finalizeInstalledUpdate } from '../../app/features/resample-runtime/r12a/finalizer.mjs';
function fail(code, message) { throw Object.assign(new Error(message), { code }); }
for (const [name, code] of [['DADUM_R10A_FINAL_RELEASE_RECEIPT','E_R12A_R10A_RELEASE_MISSING'],['DADUM_R11A_INSTALLED_FINAL_RECEIPT','E_R12A_R11A_INSTALLED_ADMISSION_MISSING'],['DADUM_R12A_INSTALLED_INPUT','E_R12A_FINAL_RECEIPT_INCOMPLETE']]) if (!process.env[name] || !fs.existsSync(process.env[name])) fail(code, `${name} is required for installed execution`);
const input = JSON.parse(fs.readFileSync(process.env.DADUM_R12A_INSTALLED_INPUT, 'utf8'));
const candidate = finalizeInstalledUpdate(input);
const out = process.env.DADUM_R12A_INSTALLED_CANDIDATE || 'artifacts/resample-runtime-01-r12a/installed/R12A_INSTALLED_CANDIDATE_RECEIPT.json';
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(candidate, null, 2) + '\n');
console.log(`R12A installed candidate written: ${out}`);
