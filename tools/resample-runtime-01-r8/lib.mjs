import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/resample-runtime-01-r8/source-bake');
export const FIXTURE_DIR = path.join(ROOT, 'fixtures/resample-runtime-01-r8');
export const PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R8';
export function ensureDirs(){fs.mkdirSync(ARTIFACT_DIR,{recursive:true});fs.mkdirSync(FIXTURE_DIR,{recursive:true});}
export function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
export function readJson(rel){return JSON.parse(read(rel));}
export function sha256Buffer(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
export function sha256File(rel){return sha256Buffer(fs.readFileSync(path.join(ROOT,rel)));}
export function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');return value;}
export function writeArtifact(name,value){ensureDirs();return writeJson(path.join(ARTIFACT_DIR,name),value);}
export function writeFixture(name,value){ensureDirs();return writeJson(path.join(FIXTURE_DIR,name),value);}
export function check(condition,code,message,detail=null){if(!condition)throw Object.assign(new Error(message),{code,detail});}
export function capture(id,fn){try{return{id,pass:true,value:fn()};}catch(error){return{id,pass:false,errorCode:String(error?.code??'E_R8_CHECK_FAILED'),message:String(error?.message??error),detail:error?.detail??null};}}
export function report(name,checks,extra={}){const pass=checks.every(x=>x.pass);return writeArtifact(name,{schemaVersion:1,patchId:PATCH_ID,pass,checks,...extra});}
export function expectError(fn,code){let caught=null;try{fn();}catch(error){caught=error;}check(caught?.code===code,'E_R8_EXPECTED_ERROR_MISSING',`Expected ${code}`,{actual:caught?.code??null});return caught.code;}
export async function expectErrorAsync(fn,code){let caught=null;try{await fn();}catch(error){caught=error;}check(caught?.code===code,'E_R8_EXPECTED_ERROR_MISSING',`Expected ${code}`,{actual:caught?.code??null});return caught.code;}
