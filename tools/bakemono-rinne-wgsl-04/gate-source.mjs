import { runSourceVerificationWgsl04 } from './verify-source.mjs';
const r = await runSourceVerificationWgsl04();
console.log(`${r.report.status} BKR04 source gates ${r.report.passCount}/${r.report.gateCount}; negative ${r.negative.passCount}/${r.negative.gateCount ?? 56}; physical ${r.physical.passCount}/${r.physical.gateCount} ${r.physical.status}`);
if (r.report.status !== 'PASS') process.exitCode = 1;
