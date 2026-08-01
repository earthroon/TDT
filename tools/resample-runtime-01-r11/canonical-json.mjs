import crypto from 'node:crypto';
export function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
export function canonicalJson(v){return JSON.stringify(canonical(v),null,2)+'\n';}
export function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
export function selfSeal(v,key='receiptSha256'){const x={...v};delete x[key];return {...x,[key]:sha256(canonicalJson(x))};}
