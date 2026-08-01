import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
export const PATCH_ID='TDT-SPECTRAL-QMAP-02';
export const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
export const ARTIFACT_DIR=path.join(ROOT,'artifacts/spectral-qmap-02/source-bake');
export const PARENT_ZIP_SHA256='48e544322f0d7a4aed7290deedca75bbada9780dea23e656b4e3f809511a17d2';
export const PARENT_SOURCE_SEAL='465f4ab940f426a581983e4f3ea53d230ead99d5cf907bc3b4e5c4cc548f9128';
export function ensureDir(p){fs.mkdirSync(p,{recursive:true});}
export function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
export function sha256File(relative){return sha256(fs.readFileSync(path.join(ROOT,relative)));}
export function canonicalize(v){if(Array.isArray(v))return v.map(canonicalize);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonicalize(v[k])]));if(typeof v==='number'&&!Number.isFinite(v))throw new Error('non-finite');return Object.is(v,-0)?0:v;}
export function canonicalJson(v){return JSON.stringify(canonicalize(v));}
export function writeJson(relative,v){const p=path.isAbsolute(relative)?relative:path.join(ROOT,relative);ensureDir(path.dirname(p));fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
export function readJson(relative){return JSON.parse(fs.readFileSync(path.join(ROOT,relative),'utf8'));}
export function text(relative){return fs.readFileSync(path.join(ROOT,relative),'utf8');}
export function exists(relative){return fs.existsSync(path.join(ROOT,relative));}
export function writeArtifact(name,v){writeJson(path.join(ARTIFACT_DIR,name),v);}
export function gateId(n){return `SQ02-${String(n).padStart(3,'0')}`;}
