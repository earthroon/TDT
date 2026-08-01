import { runSourceVerificationWgsl03 } from './verify-source.mjs';
const result=await runSourceVerificationWgsl03();
console.log(JSON.stringify(result.finalReceipt,null,2));
if(result.report.status!=='PASS')process.exitCode=1;
