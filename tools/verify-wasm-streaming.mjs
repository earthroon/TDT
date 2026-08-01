import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, ROOT, readJson, writeJson } from './build-emit-01-lib.mjs';
const routeManifest=readJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_STATIC_ROUTE_MANIFEST.json'));
const wasm=routeManifest.routes.filter((x)=>x.route.endsWith('.wasm'));
const results=[];
for(const route of wasm){
  const file=path.join(ROOT,'dist','renderer',route.route.replace(/^\//,''));
  let compileOk=false; let error=null;
  try{ await WebAssembly.compile(fs.readFileSync(file)); compileOk=true; }catch(e){ error=String(e?.message||e); }
  results.push({route:route.route,contentType:route.contentType,compileOk,error,ok:route.contentType==='application/wasm'&&compileOk});
}
const report={schemaVersion:1,patchId:'TDT-BUILD-EMIT-01',status:results.length&&results.every(x=>x.ok)?'WASM_STREAMING_VERIFIED':'BLOCKED',results};
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_WASM_STREAMING_REPORT.json'),report);
if(report.status!=='WASM_STREAMING_VERIFIED') throw new Error('E_WASM_STREAMING_MIME_UNVERIFIED');
console.log(`PASS BUILD-EMIT-01 wasm compile ${results.length}`);
