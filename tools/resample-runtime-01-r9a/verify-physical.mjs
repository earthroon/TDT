import fs from 'node:fs';
const receipt='artifacts/resample-runtime-01-r9a/physical/TDT_RESAMPLE_RUNTIME_01_R9A_PHYSICAL_FINAL_RECEIPT.json';
if(!fs.existsSync(receipt))throw Object.assign(new Error('R9A physical receipt is missing. Run the packaged Windows D3D12 harness.'),{code:'E_R9A_PHYSICAL_RECEIPT_MISSING'});
