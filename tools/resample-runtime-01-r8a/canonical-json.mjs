import crypto from 'node:crypto';
export function canonicalize(value){
  if(Array.isArray(value)) return value.map(canonicalize);
  if(value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonicalize(value[k])]));
  return value;
}
export function canonicalJson(value){return JSON.stringify(canonicalize(value));}
export function sha256(value){return crypto.createHash('sha256').update(value).digest('hex');}
export function selfSeal(value){const core={...value};delete core.selfSha256;return Object.freeze({...core,selfSha256:sha256(canonicalJson(core))});}
