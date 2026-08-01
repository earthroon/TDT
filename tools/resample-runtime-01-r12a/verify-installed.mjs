import fs from 'node:fs';
function fail(code, message, detail = null) { throw Object.assign(new Error(message), { code, detail }); }
const release = process.env.DADUM_R10A_FINAL_RELEASE_RECEIPT;
if (!release || !fs.existsSync(release)) fail('E_R12A_R10A_RELEASE_MISSING', 'R10A final release receipt is missing. Run R9A physical and R10A release replay first.');
const installedR11A = process.env.DADUM_R11A_INSTALLED_FINAL_RECEIPT;
if (!installedR11A || !fs.existsSync(installedR11A)) fail('E_R12A_R11A_INSTALLED_ADMISSION_MISSING', 'R11A installed final receipt is missing. Run the packaged Windows Electron installed admission harness.');
const finalPath = process.env.DADUM_R12A_INSTALLED_FINAL_RECEIPT;
if (!finalPath || !fs.existsSync(finalPath)) fail('E_R12A_FINAL_RECEIPT_INCOMPLETE', 'R12A installed final receipt is missing. Run the packaged atomic update and recovery matrix harness.');
const receipt = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
if (receipt.state !== 'RESAMPLE_RUNTIME_R12A_ATOMIC_UPDATE_MAIN_INTEGRATION_AND_INTERRUPTED_RECOVERY_SEALED_AWAITING_R13A') fail('E_R12A_FINAL_RECEIPT_INCOMPLETE', 'R12A installed final state mismatch', receipt.state);
if (receipt.counts?.PASS !== 840 || receipt.counts?.PENDING !== 0 || receipt.counts?.FAIL !== 0) fail('E_R12A_FINAL_RECEIPT_INCOMPLETE', 'R12A installed gate counts incomplete', receipt.counts);
if (receipt.productionPointerMutated !== false || receipt.localActivationPointerCasCount !== 1 || receipt.crossGenerationAssetCount !== 0) fail('E_R12A_FINAL_RECEIPT_INCOMPLETE', 'R12A installed invariants incomplete');
console.log('TDT-RESAMPLE-RUNTIME-01-R12A 360 SOURCE PASS / 480 INSTALLED PASS / 0 FAIL');
