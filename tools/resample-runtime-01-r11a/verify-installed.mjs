import fs from 'node:fs';
function fail(code, message, detail = null) { throw Object.assign(new Error(message), { code, detail }); }
const finalRelease = process.env.DADUM_R10A_FINAL_RELEASE_RECEIPT;
if (!finalRelease || !fs.existsSync(finalRelease)) fail('E_R11A_R10A_RELEASE_MISSING', 'R10A final release receipt is missing. Run R9A physical and R10A release replay first.');
const installedFinal = process.env.DADUM_R11A_INSTALLED_FINAL_RECEIPT;
if (!installedFinal || !fs.existsSync(installedFinal)) fail('E_R11A_INSTALLED_FINAL_RECEIPT_MISSING', 'R11A installed final receipt is missing. Run the packaged Windows Electron installed harness.');
const receipt = JSON.parse(fs.readFileSync(installedFinal, 'utf8'));
if (receipt.state !== 'RESAMPLE_RUNTIME_R11A_ELECTRON_STARTUP_ATTESTATION_AND_RUNTIME_ADMISSION_SEALED_AWAITING_R12A') fail('E_R11A_INSTALLED_FINAL_RECEIPT_INVALID', 'R11A installed final state mismatch', receipt.state);
if (receipt.sourcePass !== 332 || receipt.installedPass !== 400 || receipt.pending !== 0 || receipt.fail !== 0) fail('E_R11A_INSTALLED_FINAL_RECEIPT_INVALID', 'R11A installed gate counts incomplete');
console.log('TDT-RESAMPLE-RUNTIME-01-R11A 332 SOURCE PASS / 400 INSTALLED PASS / 0 FAIL');
