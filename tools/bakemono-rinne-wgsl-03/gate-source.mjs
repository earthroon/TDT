import { runSourceVerificationWgsl03 } from './verify-source.mjs';
const result=await runSourceVerificationWgsl03();
if(result.report.status!=='PASS')process.exitCode=1;
