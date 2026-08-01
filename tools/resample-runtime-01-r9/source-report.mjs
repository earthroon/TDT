import { capture, check, sha256File, writeSourceArtifact } from './lib.mjs';
export {capture,check,sha256File,writeSourceArtifact};
export function writeReport(name,checks,extra={}){const pass=checks.every(x=>x.status==='PASS');return writeSourceArtifact(name,{schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R9',pass,checks,...extra});}
