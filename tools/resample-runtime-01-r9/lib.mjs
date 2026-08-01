import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { R9_PATCH_ID } from './identity.mjs';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const TOOL_DIR = path.join(ROOT, 'tools/resample-runtime-01-r9');
export const SOURCE_ARTIFACT_DIR = path.join(ROOT, 'artifacts/resample-runtime-01-r9/source-bake');
export const PHYSICAL_ARTIFACT_ROOT = path.join(ROOT, 'artifacts/resample-runtime-01-r9/physical-runs');
export const FIXTURE_DIR = path.join(ROOT, 'fixtures/resample-runtime-01-r9');
export function ensureDir(dir){ fs.mkdirSync(dir,{recursive:true}); return dir; }
export function canonicalize(value){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number')return Number.isFinite(value)?value:String(value);
  if(typeof value==='bigint')return `${value}n`;
  if(Array.isArray(value))return value.map(canonicalize);
  if(typeof value==='object'){const out={};for(const key of Object.keys(value).sort())out[key]=canonicalize(value[key]);return out;}
  return String(value);
}
export function stableJson(value){return JSON.stringify(canonicalize(value),null,2)+'\n';}
export function sha256Buffer(value){return crypto.createHash('sha256').update(value).digest('hex');}
export function sha256File(relativePath){return sha256Buffer(fs.readFileSync(path.join(ROOT,relativePath)));}
export function read(relativePath){return fs.readFileSync(path.join(ROOT,relativePath),'utf8');}
export function readJson(relativePath){return JSON.parse(read(relativePath));}
export function atomicWriteFile(filePath,data){
  ensureDir(path.dirname(filePath));
  const temp=`${filePath}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
  const fd=fs.openSync(temp,'wx');
  try{fs.writeFileSync(fd,data);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  fs.renameSync(temp,filePath);
}
export function atomicWriteJson(filePath,value){atomicWriteFile(filePath,stableJson(value));return value;}
export function writeSourceArtifact(name,value){return atomicWriteJson(path.join(SOURCE_ARTIFACT_DIR,name),value);}
export function writeFixture(name,value){return atomicWriteJson(path.join(FIXTURE_DIR,name),value);}
export function check(condition,code,message,detail=null){if(!condition)throw Object.assign(new Error(message),{code,detail});return true;}
export function capture(id,fn){try{return{id,status:'PASS',evidence:fn()??true};}catch(error){return{id,status:'FAIL',errorCode:String(error?.code??'E_R9_SOURCE_HARNESS_INCOMPLETE'),message:String(error?.message??error),detail:error?.detail??null};}}
export function fileExists(relativePath){return fs.existsSync(path.join(ROOT,relativePath));}
export function sourceSyntaxFiles(){
  const roots=['tools/resample-runtime-01-r9','app/electron','app/renderer/physical-r9'];const out=[];
  for(const root of roots){const full=path.join(ROOT,root);if(!fs.existsSync(full))continue;const stack=[full];while(stack.length){const d=stack.pop();for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())stack.push(p);else if(/\.(?:mjs|cjs|js)$/.test(e.name))out.push(path.relative(ROOT,p).replaceAll(path.sep,'/'));}}}
  return out.sort();
}
export function productionPointerDigest(){
  const candidates=['artifacts/runtime/TDT_RUNTIME_SSOT_01_R7_PRODUCTION_POINTER.json','artifacts/export-promotion-03/TDT_EXPORT_PROMOTION_03_PRODUCTION_POINTER.json','artifacts/promotion-baseline-00/production-pointer.json'];
  const rows=candidates.filter(fileExists).map(relativePath=>({relativePath,sha256:sha256File(relativePath)}));
  return {rows,digest:sha256Buffer(stableJson(rows))};
}
export function cleanSourceArtifacts(){fs.rmSync(SOURCE_ARTIFACT_DIR,{recursive:true,force:true});ensureDir(SOURCE_ARTIFACT_DIR);ensureDir(FIXTURE_DIR);}
export const PATCH_ID=R9_PATCH_ID;
