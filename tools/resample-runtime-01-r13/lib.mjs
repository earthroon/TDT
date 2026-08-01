import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {canonicalJson,sha256,selfSeal} from './canonical-json.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const TOOL=path.join(ROOT,'tools/resample-runtime-01-r13');
export const SOURCE=path.join(ROOT,'artifacts/resample-runtime-01-r13/source-bake');
export const FLEET=path.join(ROOT,'artifacts/resample-runtime-01-r13/fleet');
export function ensure(p){fs.mkdirSync(p,{recursive:true});return p;}
export function abs(rel){return path.join(ROOT,rel);}
export function exists(rel){return fs.existsSync(abs(rel));}
export function read(rel){return fs.readFileSync(abs(rel),'utf8');}
export function json(rel){return JSON.parse(read(rel));}
export function hashFile(rel){return sha256(fs.readFileSync(abs(rel)));}
export function check(c,code,msg,detail=null){if(!c){const e=new Error(msg);e.code=code;e.detail=detail;throw e;}return true;}
export function writeJson(file,v){ensure(path.dirname(file));fs.writeFileSync(file,JSON.stringify(v,null,2)+'\n');return v;}
export function sourceArtifact(name,v){return writeJson(path.join(ensure(SOURCE),name),v);}
export function fleetArtifact(name,v){return writeJson(path.join(ensure(FLEET),name),v);}
export function capture(id,name,fn){try{return {id,name,status:'PASS',evidence:fn()??true};}catch(e){return {id,name,status:'FAIL',errorCode:e.code||'E_R13_CONTRACT_IDENTITY_MISMATCH',message:e.message,detail:e.detail??null};}}
export function seal(v){return selfSeal(v);}
export function tempDir(prefix='r13-'){return fs.mkdtempSync(path.join(ROOT,`.${prefix}`));}
