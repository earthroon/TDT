import crypto from 'node:crypto';
export function canonicalize(v){
 if(v===null||typeof v==='string'||typeof v==='boolean')return v;
 if(typeof v==='number'){if(!Number.isFinite(v))throw Object.assign(new Error('nonfinite canonical number'),{code:'E_R10_POINTER_SCHEMA_INVALID'});return Object.is(v,-0)?0:v;}
 if(Array.isArray(v))return v.map(canonicalize);
 if(typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=canonicalize(v[k]);return o;}
 throw Object.assign(new Error('unsupported canonical value'),{code:'E_R10_POINTER_SCHEMA_INVALID'});
}
export function canonicalJson(v){return JSON.stringify(canonicalize(v),null,2)+'\n';}
export function sha256Buffer(v){return crypto.createHash('sha256').update(v).digest('hex');}
export function digestCanonical(v){return sha256Buffer(canonicalJson(v));}
export function withSelfHash(v,field='receiptSha256'){const o={...v};delete o[field];return {...o,[field]:digestCanonical(o)};}
export function verifySelfHash(v,field='receiptSha256'){const x=v?.[field];const o={...v};delete o[field];return typeof x==='string'&&x===digestCanonical(o);}
