import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {runSourceVerification} from './verify-source.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');const r=await runSourceVerification();if(r.report.status!=='PASS')process.exitCode=1;else console.log(JSON.stringify(r.finalReceipt,null,2));
