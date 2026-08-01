import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
export const ARTIFACT_DIR=path.join(ROOT,'artifacts/resample-runtime-01-r1d/source-bake');
export const PATCH_ID='TDT-RESAMPLE-RUNTIME-01-R1D';
export function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
export function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
export function sha256File(rel){return sha256(fs.readFileSync(path.join(ROOT,rel)));}
export function writeJson(name,value){fs.mkdirSync(ARTIFACT_DIR,{recursive:true});fs.writeFileSync(path.join(ARTIFACT_DIR,name),JSON.stringify(value,null,2)+'\n');}
export function check(pass,id,message,detail=null){return {id,pass:Boolean(pass),message,detail};}
