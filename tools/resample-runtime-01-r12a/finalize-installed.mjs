import fs from 'node:fs';
import path from 'node:path';
function fail(code, message) { throw Object.assign(new Error(message), { code }); }
const candidatePath = process.env.DADUM_R12A_INSTALLED_CANDIDATE;
const gatePath = process.env.DADUM_R12A_INSTALLED_GATE_REPORT;
if (!candidatePath || !fs.existsSync(candidatePath) || !gatePath || !fs.existsSync(gatePath)) fail('E_R12A_FINAL_RECEIPT_INCOMPLETE', 'installed candidate and 480-gate report are required');
const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8')); const gate = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
if (candidate.state !== 'RESAMPLE_RUNTIME_R12A_ATOMIC_UPDATE_MAIN_INTEGRATION_AND_INTERRUPTED_RECOVERY_SEALED_AWAITING_R13A' || gate.counts?.PASS !== 480 || gate.counts?.FAIL !== 0) fail('E_R12A_FINAL_RECEIPT_INCOMPLETE', 'installed candidate or gate report invalid');
const out = process.env.DADUM_R12A_INSTALLED_FINAL_OUTPUT || 'artifacts/resample-runtime-01-r12a/installed/TDT_RESAMPLE_RUNTIME_01_R12A_INSTALLED_FINAL_RECEIPT.json';
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(candidatePath, out); console.log(`R12A installed final receipt written: ${out}`);
