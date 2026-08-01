import { runSourceVerification } from './verify-source.mjs';
const r=await runSourceVerification();if(r.report.status!=='PASS')process.exitCode=1;
