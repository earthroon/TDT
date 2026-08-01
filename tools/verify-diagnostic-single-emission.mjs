import fs from 'node:fs';

const service = fs.readFileSync('app/src/runtime/diagnostics-service.ts', 'utf8');
const adapter = fs.readFileSync('app/src/legacy/legacy-runtime-adapter.ts', 'utf8');
const boot = fs.readFileSync('app/src/boot/bootstrap-renderer.ts', 'utf8');
const failures = [];
if (!service.includes('errorOnce(') || !service.includes('#errorFingerprints')) failures.push('DiagnosticsService single-emission registry missing');
if (!adapter.includes('this.diagnostics.errorOnce(stable.code')) failures.push('Legacy adapter does not use errorOnce');
if ((boot.match(/diagnostics\.errorOnce\(stable\.code/g) ?? []).length < 2) failures.push('Boot propagation layers do not use errorOnce');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('PASS GATE-R1-R2-DIAG diagnostic error single-emission');
