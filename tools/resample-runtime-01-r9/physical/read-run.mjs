import fs from 'node:fs';import path from 'node:path';
export function resolveRunDir(root,runId){const dir=path.resolve(root,'artifacts/resample-runtime-01-r9/physical-runs',String(runId));if(!fs.existsSync(dir))throw Object.assign(new Error(`R9 physical run missing: ${dir}`),{code:'E_R9_CHILD_EVIDENCE_MISSING'});return dir;}
export function readRunJson(dir,name){const file=path.join(dir,name);if(!fs.existsSync(file))throw Object.assign(new Error(`R9 evidence missing: ${name}`),{code:'E_R9_CHILD_EVIDENCE_MISSING'});return JSON.parse(fs.readFileSync(file,'utf8'));}
