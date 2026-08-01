import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
export const PATCH_ID='TDT-ANALYSIS-FIELD-TRUTH-00';
export const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
export const ARTIFACT_DIR=path.join(ROOT,'artifacts/analysis-field-truth-00/source-bake');
export const PARENT_ZIP_SHA256='89e824847d0c477cffbf7a1f2d807c32f7a41872243d292734f46b01ebe00b5a';
export const PARENT_SOURCE_SEAL='f3af1f740a76ebfc6c07293b0287dfceee18f0202f8929ea88365d24dbc17f3b';
export function ensureDir(p){fs.mkdirSync(p,{recursive:true});}
export function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
export function sha256File(relative){return sha256(fs.readFileSync(path.join(ROOT,relative)));}
export function canonicalize(v){if(Array.isArray(v))return v.map(canonicalize);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonicalize(v[k])]));if(typeof v==='number'&&!Number.isFinite(v))throw new Error('non-finite');return Object.is(v,-0)?0:v;}
export function canonicalJson(v){return JSON.stringify(canonicalize(v));}
export function writeJson(relative,v){const p=path.isAbsolute(relative)?relative:path.join(ROOT,relative);ensureDir(path.dirname(p));fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
export function readJson(relative){return JSON.parse(fs.readFileSync(path.join(ROOT,relative),'utf8'));}
export function listFiles(base){const root=path.join(ROOT,base);const out=[];function walk(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.isFile())out.push(path.relative(ROOT,p).replaceAll('\\','/'));}}walk(root);return out;}
export function writeArtifact(name,v){writeJson(path.join(ARTIFACT_DIR,name),v);}
export function gateId(n){return `AFT00-${String(n).padStart(3,'0')}`;}
