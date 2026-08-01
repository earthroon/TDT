import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/resample-runtime-01-r7/source-bake');
export const FIXTURE_DIR = path.join(ROOT, 'fixtures/resample-runtime-01-r7');
export function ensureDirs(){fs.mkdirSync(ARTIFACT_DIR,{recursive:true});fs.mkdirSync(FIXTURE_DIR,{recursive:true});}
export function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
export function readJson(rel){return JSON.parse(read(rel));}
export function sha256Buffer(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
export function sha256File(rel){return sha256Buffer(fs.readFileSync(path.join(ROOT,rel)));}
export function writeArtifact(name,value){ensureDirs();fs.writeFileSync(path.join(ARTIFACT_DIR,name),JSON.stringify(value,null,2)+'\n');return value;}
export function writeFixture(name,value){ensureDirs();fs.writeFileSync(path.join(FIXTURE_DIR,name),JSON.stringify(value,null,2)+'\n');return value;}
export function check(condition, code, message, detail=null){if(!condition){const e=Object.assign(new Error(message),{code,detail});throw e;}}
export function report(name,checks,extra={}){const pass=checks.every(x=>x.pass);return writeArtifact(name,{schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R7',pass,checks,...extra});}
export function capture(id,fn){try{const value=fn();return {id,pass:true,value};}catch(error){return {id,pass:false,errorCode:String(error?.code??'E_R7_CHECK_FAILED'),message:String(error?.message??error)};}}
