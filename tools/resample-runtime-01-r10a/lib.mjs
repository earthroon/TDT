import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT=process.cwd();
export const OUT=path.join(ROOT,'artifacts/resample-runtime-01-r10a/source-bake');
export const RUN_ROOT=path.resolve(process.env.DADUM_R10A_EVIDENCE_ROOT||path.join(ROOT,'artifacts/resample-runtime-01-r10a'));
export function check(v,code,message,detail=null){if(!v)throw Object.assign(new Error(message),{code,detail});return v;}
export function stableError(code,message,detail=null){return Object.assign(new Error(message),{code,detail});}
export function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
export function json(rel){return JSON.parse(read(rel));}
export function exists(rel){return fs.existsSync(path.join(ROOT,rel));}
export function sha256Bytes(v){return crypto.createHash('sha256').update(v).digest('hex');}
export function sha256File(rel){return sha256Bytes(fs.readFileSync(path.join(ROOT,rel)));}
export function canonical(v){if(v===null||typeof v==='string'||typeof v==='boolean')return v;if(typeof v==='number'){check(Number.isFinite(v),'E_R10A_RECEIPT_SCHEMA_INVALID','nonfinite canonical number');return Object.is(v,-0)?0:v;}if(Array.isArray(v))return v.map(canonical);if(typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=canonical(v[k]);return o;}throw stableError('E_R10A_RECEIPT_SCHEMA_INVALID','unsupported canonical value');}
export function canonicalJson(v){return JSON.stringify(canonical(v),null,2)+'\n';}
export function digestCanonical(v){return sha256Bytes(canonicalJson(v));}
export function seal(v,field='selfSha256'){const o={...v};delete o[field];return Object.freeze({...canonical(o),[field]:digestCanonical(o)});}
export function verifySelf(v,field='selfSha256'){const expected=v?.[field];const o={...v};delete o[field];const c=canonical(o);return typeof expected==='string'&&(expected===digestCanonical(o)||expected===sha256Bytes(JSON.stringify(c)));}
export function ensureDir(p){fs.mkdirSync(p,{recursive:true});return p;}
export function atomicWrite(p,data,{overwrite=true}={}){ensureDir(path.dirname(p));if(!overwrite&&fs.existsSync(p))throw stableError('E_R10A_RELEASE_RECEIPT_INCOMPLETE','output exists',p);const tmp=path.join(path.dirname(p),`.${path.basename(p)}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`);const fd=fs.openSync(tmp,'wx');try{fs.writeFileSync(fd,data);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.renameSync(tmp,p);}
export function atomicJson(p,v,opts){atomicWrite(p,canonicalJson(v),opts);return v;}
export function sourceArtifact(name,v){ensureDir(OUT);return atomicJson(path.join(OUT,name),v);}
export function capture(id,fn){try{return{id,status:'PASS',evidence:fn()??true};}catch(e){return{id,status:'FAIL',errorCode:String(e?.code||'E_R10A_RELEASE_RECEIPT_INCOMPLETE'),message:String(e?.message||e),detail:e?.detail??null};}}
export function runId(){const x=process.env.DADUM_R10A_RUN_ID;check(x&&/^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$/.test(x),'E_R10A_RELEASE_RECEIPT_INCOMPLETE','DADUM_R10A_RUN_ID required');return x;}
export function runDir(){return ensureDir(path.join(RUN_ROOT,runId()));}
export function runArtifact(name,v,{overwrite=false}={}){return atomicJson(path.join(runDir(),name),v,{overwrite});}
export function readExternalJson(envName,code){const p=process.env[envName];check(p&&path.isAbsolute(p)&&fs.existsSync(p),code,`${envName} missing`,p||null);return{path:p,value:JSON.parse(fs.readFileSync(p,'utf8')),sha256:sha256Bytes(fs.readFileSync(p))};}
export function requireReleaseMode(){check(process.env.DADUM_R10A_RELEASE_MODE==='1','E_R10A_SOURCE_CANNOT_RELEASE','R10A release mode required');}
export function randomId192(){return crypto.randomBytes(24).toString('hex');}
