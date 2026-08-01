import { exists, readJson, verifySelf, check } from './lib.mjs';
const relative = 'artifacts/resample-runtime-01-r9a-p1-r2/packaged/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R1_PACKAGED_FINAL_RECEIPT.json';
if (!exists(relative)) {
  console.log('TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1 PACKAGED PHYSICAL PENDING / final receipt absent');
  process.exitCode = 2;
} else {
  const receipt = readJson(relative);
  check(verifySelf(receipt), 'E_R9AP1R2R1_PACKAGED_FINAL_HASH', 'Packaged final receipt self hash invalid');
  check(receipt.state === 'PHYSICAL_SEMANTIC_SEAL_PASS' && receipt.counts?.PASS === 26 && receipt.counts?.FAIL === 0, 'E_R9AP1R2R1_PACKAGED_FINAL_STATE', 'Packaged final receipt state invalid');
  console.log('TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1 PACKAGED PHYSICAL VERIFIED 26/26');
}
