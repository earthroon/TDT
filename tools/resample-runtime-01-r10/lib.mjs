import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
import {canonicalJson,sha256Buffer,withSelfHash} from './canonical-json.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const TOOL_DIR=path.join(ROOT,'tools/resample-runtime-01-r10');
export const SOURCE_DIR=path.join(ROOT,'artifacts/resample-runtime-01-r10/source-bake');
export const RUN_ROOT=path.resolve(process.env.DADUM_R10_EVIDENCE_ROOT||path.join(ROOT,'artifacts/resample-runtime-01-r10'));
export function ensureDir(p){fs.mkdirSync(p,{recursive:true});return p;}
export function resolveRoot(rel){return path.join(ROOT,rel);}
export function read(rel){return fs.readFileSync(resolveRoot(rel),'utf8');}
export function readJson(rel){return JSON.parse(read(rel));}
export function sha256FilePath(p){return sha256Buffer(fs.readFileSync(p));}
export function sha256File(rel){return sha256FilePath(resolveRoot(rel));}
export function exists(rel){return fs.existsSync(resolveRoot(rel));}
export function check(c,code,msg,detail=null){if(!c)throw Object.assign(new Error(msg),{code,detail});return true;}
export function atomicWrite(p,data,{overwrite=true}={}){ensureDir(path.dirname(p));if(!overwrite&&fs.existsSync(p))throw Object.assign(new Error('output exists'),{code:'E_R10_RELEASE_RECEIPT_INCOMPLETE',detail:p});const t=path.join(path.dirname(p),`.${path.basename(p)}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`);const fd=fs.openSync(t,'wx');try{fs.writeFileSync(fd,data);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.renameSync(t,p);}
export function atomicJson(p,v,opts){atomicWrite(p,canonicalJson(v),opts);return v;}
export function sourceArtifact(name,v){ensureDir(SOURCE_DIR);return atomicJson(path.join(SOURCE_DIR,name),v);}
export function runId(){const x=process.env.DADUM_R10_RUN_ID;if(!x||!/^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$/.test(x))throw Object.assign(new Error('DADUM_R10_RUN_ID required'),{code:'E_R10_RELEASE_RECEIPT_INCOMPLETE'});return x;}
export function runDir(){const d=path.join(RUN_ROOT,runId());ensureDir(d);return d;}
export function runArtifact(name,v,{overwrite=false}={}){return atomicJson(path.join(runDir(),name),v,{overwrite});}
export function readExternalJson(envName,missingCode){const p=process.env[envName];if(!p||!path.isAbsolute(p)||!fs.existsSync(p))throw Object.assign(new Error(`${envName} missing`),{code:missingCode,detail:p||null});return {path:p,value:JSON.parse(fs.readFileSync(p,'utf8')),sha256:sha256FilePath(p)};}
export function capture(id,fn){try{return{id,status:'PASS',evidence:fn()??true};}catch(e){return{id,status:'FAIL',errorCode:String(e?.code||'E_R10_RELEASE_RECEIPT_INCOMPLETE'),message:String(e?.message||e),detail:e?.detail??null};}}
export function seal(v){return withSelfHash(v,'receiptSha256');}
export function noNetworkDefault(){return process.env.DADUM_R10_ALLOW_NETWORK!=='1';}
