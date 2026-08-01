import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {canonicalJson,sha256,selfSeal} from './canonical-json.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const TOOL=path.join(ROOT,'tools/resample-runtime-01-r8a');
export const SOURCE=path.join(ROOT,'artifacts/resample-runtime-01-r8a/source-bake');
export const SPEC='specs/TDT-RESAMPLE-RUNTIME-01-R8A_ACTIVE_REQUIRED_JAVASCRIPT_PARSE_CLOSURE_CANONICAL_RESAMPLE_EXECUTOR_REGISTRATION_ACTUAL_KERNEL_IDENTITY_PROPAGATION_REPEATED_DEVICE_LOSS_RE_REGISTRATION_ZERO_SILENT_EXPORT_FALLBACK_SEAL_SPEC.md';
export function ensure(p){fs.mkdirSync(p,{recursive:true});return p;}
export function abs(rel){return path.join(ROOT,rel);}
export function exists(rel){return fs.existsSync(abs(rel));}
export function read(rel){return fs.readFileSync(abs(rel),'utf8');}
export function json(rel){return JSON.parse(read(rel));}
export function hashFile(rel){return sha256(fs.readFileSync(abs(rel)));}
export function check(condition,code,message,detail=null){if(!condition){const error=new Error(message);error.code=code;error.detail=detail;throw error;}return true;}
export function writeJson(file,value){ensure(path.dirname(file));fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');return value;}
export function sourceArtifact(name,value){return writeJson(path.join(ensure(SOURCE),name),value);}
export function seal(value){return selfSeal(value);}
export function capture(id,name,fn){try{return {id,name,status:'PASS',evidence:fn()??true};}catch(error){return {id,name,status:'FAIL',errorCode:error.code||'E_R8A_SOURCE_GATE_FAILED',message:error.message,detail:error.detail??null};}}
export function parseGateRequirements(){
  const text=read(SPEC);const source=[],physical=[];
  for(const match of text.matchAll(/\| `((?:R8A-S|R8A-P)\d{3})` \| ([^|]+?) \|/g)){
    const row={id:match[1],requirement:match[2].trim()};
    (row.id.startsWith('R8A-S')?source:physical).push(row);
  }
  source.sort((a,b)=>a.id.localeCompare(b.id));physical.sort((a,b)=>a.id.localeCompare(b.id));
  return {sourceMandatory:source,physicalRevalidation:physical};
}
export function runNode(relative,args=[]){
  const result=spawnSync(process.execPath,[abs(relative),...args],{cwd:ROOT,encoding:'utf8',env:process.env});
  if(result.status!==0){const error=new Error(`Child verification failed: ${relative}\n${result.stdout}\n${result.stderr}`);error.code='E_R8A_CHILD_VERIFICATION_FAILED';throw error;}
  return {stdout:result.stdout.trim(),stderr:result.stderr.trim()};
}
export {canonicalJson,sha256};
