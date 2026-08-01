import crypto from 'node:crypto';
export function canonicalize(value){if(value===null||typeof value==='string'||typeof value==='boolean')return value;if(typeof value==='number'){if(!Number.isFinite(value))throw new TypeError('nonfinite');return Object.is(value,-0)?0:value;}if(Array.isArray(value))return value.map(canonicalize);if(typeof value==='object'){const out={};for(const key of Object.keys(value).sort())if(value[key]!==undefined)out[key]=canonicalize(value[key]);return out;}throw new TypeError(`unsupported:${typeof value}`);}
export const canonicalJson=value=>JSON.stringify(canonicalize(value));
export const digest=value=>crypto.createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:canonicalJson(value)).digest('hex');
export function seal(body){return Object.freeze({...body,selfSha256:digest(body)});}
export function verifySelf(value){if(!value||!/^[0-9a-f]{64}$/.test(String(value.selfSha256??'')))return false;const body={...value};const self=body.selfSha256;delete body.selfSha256;return digest(body)===self;}
