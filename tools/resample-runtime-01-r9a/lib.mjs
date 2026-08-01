import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT=process.cwd();
export const OUT=path.join(ROOT,'artifacts/resample-runtime-01-r9a/source-bake');
export function check(value,code,message,detail=null){if(!value)throw Object.assign(new Error(message),{code,detail});}
export function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
export function json(rel){return JSON.parse(read(rel));}
export function sha256Bytes(value){return crypto.createHash('sha256').update(value).digest('hex');}
export function sha256File(rel){return sha256Bytes(fs.readFileSync(path.join(ROOT,rel)));}
export function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object'){const out={};for(const key of Object.keys(value).sort())out[key]=canonical(value[key]);return out;}return value;}
export function seal(value){const base=canonical(value);return Object.freeze({...base,selfSha256:sha256Bytes(JSON.stringify(base))});}
export function sourceArtifact(name,value){fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');return value;}
export function stableError(code,message,detail=null){return Object.assign(new Error(message),{code,detail});}
