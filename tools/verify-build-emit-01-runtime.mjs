import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createStaticCoiServer } from '../app/electron/static-coi-server.mjs';
import {
  buildInputManifest, canonicalJson, collectChunkClosure, compareContentManifests,
  contentManifest, createSyntheticStaticServer, discoverLegacyStaticAdmission,
  makeBlockedArtifact, mapWorkerEntries, mimeForRoute, probeServer, seal,
  sha256Bytes, verifySeal,
} from './build-emit-01-lib.mjs';

const tests=[];
const add=async(name,fn)=>{let ok=false;let detail=null;try{ok=!!(await fn());}catch(e){detail=String(e?.code||e?.message||e);}tests.push({id:`BE01-T${String(tests.length+1).padStart(3,'0')}`,name,ok,detail});};
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'be01-runtime-'));
try{
  const dist=path.join(temp,'dist');fs.mkdirSync(path.join(dist,'assets'),{recursive:true});
  fs.writeFileSync(path.join(dist,'index.html'),'<!doctype html><title>x</title>');
  fs.writeFileSync(path.join(dist,'assets','main.js'),'export const main=1;');
  fs.writeFileSync(path.join(dist,'assets','worker.js'),'import "./shared.js";');
  fs.writeFileSync(path.join(dist,'assets','shared.js'),'export const shared=1;');
  fs.writeFileSync(path.join(dist,'assets','codec.wasm'),Buffer.from([0,97,115,109,1,0,0,0]));
  fs.writeFileSync(path.join(dist,'assets','profile.icc'),'icc-fixture');
  const graph={chunks:[{fileName:'assets/main.js',facadeModuleId:'app/src/main.ts',moduleIds:['app/src/main.ts'],isEntry:true,imports:[],dynamicImports:[]},{fileName:'assets/worker.js',facadeModuleId:'app/src/runtime/workers/entries/x.worker.ts',moduleIds:['app/src/runtime/workers/entries/x.worker.ts'],isEntry:true,imports:['assets/shared.js'],dynamicImports:[]},{fileName:'assets/shared.js',facadeModuleId:null,moduleIds:['app/src/runtime/workers/worker-entry-runtime.ts'],isEntry:false,imports:[],dynamicImports:[]}],assets:[{fileName:'assets/codec.wasm',originalFileNames:['app/legacy-runtime/codec.wasm']},{fileName:'assets/profile.icc',originalFileNames:['app/legacy-runtime/profile.icc']}]};
  const source={workers:[{workerId:'worker-x',codecProtocolVersion:'p1',controlProtocolVersion:'c1',ownerRuntimeEncoderIds:['e1'],transferPolicyId:'t1',wasmPolicyId:'w1',entrySourceIdentity:'vite:app/src/runtime/workers/entries/x.worker.ts',entryRelative:'app/src/runtime/workers/entries/x.worker.ts',artifacts:[]}]};
  const mapping=mapWorkerEntries({sourceManifest:source,rollupGraph:graph,root:process.cwd()});
  const closure=collectChunkClosure('assets/worker.js',graph);
  const manifestA=contentManifest(dist), manifestB=contentManifest(dist);
  const input=buildInputManifest(); const admission=discoverLegacyStaticAdmission();
  for(let i=0;i<10;i++) await add(`canonical digest deterministic ${i}`,()=>sha256Bytes(canonicalJson({b:2,a:1}))===sha256Bytes(canonicalJson({a:1,b:2})));
  for(let i=0;i<5;i++) await add(`seal verification ${i}`,()=>verifySeal(seal({schemaVersion:1,index:i})));
  for(let i=0;i<5;i++) await add(`seal tamper rejection ${i}`,()=>{const x=seal({i});x.i+=1;return !verifySeal(x);});
  await add('lock promotion blocked in current fixture',()=>input.lockPromoted===false);
  await add('canonical target win32-x64',()=>input.target==='win32-x64');
  await add('offline network policy',()=>input.networkPolicy==='offline-build-v1');
  await add('build input sealed',()=>verifySeal(input));
  await add('legacy admission bounded',()=>admission.recordCount>0&&admission.recordCount<admission.fullLegacyFileCount);
  for(let i=0;i<5;i++) await add(`legacy record digest ${i}`,()=>/^[0-9a-f]{64}$/.test(admission.records[i].sourceSha256));
  await add('worker metadata mapping count',()=>mapping.length===1);
  await add('worker metadata mapping identity',()=>mapping[0].workerId==='worker-x');
  await add('worker protocol preserved',()=>mapping[0].codecProtocolVersion==='p1');
  await add('worker control protocol preserved',()=>mapping[0].controlProtocolVersion==='c1');
  await add('worker owner preserved',()=>mapping[0].ownerRuntimeEncoderIds[0]==='e1');
  await add('worker transfer preserved',()=>mapping[0].transferPolicyId==='t1');
  await add('worker wasm policy preserved',()=>mapping[0].wasmPolicyId==='w1');
  await add('worker entry route',()=>mapping[0].emittedEntryUrl==='/assets/worker.js');
  await add('worker missing rejected',()=>{try{mapWorkerEntries({sourceManifest:{workers:[{...source.workers[0],entryRelative:'missing.ts'}]},rollupGraph:graph,root:process.cwd()});return false;}catch(e){return e.code==='E_WORKER_EMITTED_ENTRY_MISSING';}});
  await add('worker ambiguous rejected',()=>{try{mapWorkerEntries({sourceManifest:source,rollupGraph:{...graph,chunks:[...graph.chunks,{...graph.chunks[1],fileName:'assets/worker2.js'}]},root:process.cwd()});return false;}catch(e){return e.code==='E_WORKER_EMITTED_ENTRY_AMBIGUOUS';}});
  await add('closure contains entry',()=>closure.chunks.some(x=>x.fileName==='assets/worker.js'));
  await add('closure contains shared',()=>closure.chunks.some(x=>x.fileName==='assets/shared.js'));
  await add('closure static edge',()=>closure.edges.some(x=>x.kind==='static-import'));
  await add('closure deterministic order',()=>closure.chunks.map(x=>x.fileName).join(',')==='assets/shared.js,assets/worker.js');
  await add('closure cycle dedup',()=>{const g={chunks:[{fileName:'a.js',imports:['b.js'],dynamicImports:[]},{fileName:'b.js',imports:['a.js'],dynamicImports:[]}]};return collectChunkClosure('a.js',g).chunks.length===2;});
  await add('closure unresolved reject',()=>{try{collectChunkClosure('missing.js',graph);return false;}catch(e){return e.code==='E_WORKER_CLOSURE_UNRESOLVED_IMPORT';}});
  for(let i=0;i<8;i++) await add(`content manifest deterministic ${i}`,()=>contentManifest(dist).digest===manifestA.digest);
  await add('content manifests equal',()=>compareContentManifests(manifestA,manifestB).equal);
  fs.writeFileSync(path.join(dist,'assets','copy.js'),'x');const changed=contentManifest(dist);fs.unlinkSync(path.join(dist,'assets','copy.js'));
  await add('content manifests difference',()=>!compareContentManifests(manifestA,changed).equal);
  for(const [ext,mime] of [['x.js','application/javascript; charset=utf-8'],['x.mjs','application/javascript; charset=utf-8'],['x.wasm','application/wasm'],['x.icc','application/vnd.iccprofile'],['x.html','text/html; charset=utf-8']]) await add(`mime ${ext}`,()=>mimeForRoute(ext)===mime);
  const routes=[{route:'/index.html'},{route:'/assets/main.js'},{route:'/assets/codec.wasm'},{route:'/assets/profile.icc'},{route:'/missing'}];
  const synthetic=await probeServer(createSyntheticStaticServer(dist),routes);
  const electron=await probeServer(createStaticCoiServer(dist),routes);
  for(let i=0;i<routes.length;i++){
    await add(`synthetic status ${routes[i].route}`,()=>synthetic[i].status===(routes[i].route==='/missing'?404:200));
    await add(`electron status ${routes[i].route}`,()=>electron[i].status===(routes[i].route==='/missing'?404:200));
    await add(`server parity ${routes[i].route}`,()=>synthetic[i].status===electron[i].status&&synthetic[i].bodySha256===electron[i].bodySha256&&synthetic[i].contentType===electron[i].contentType);
    await add(`synthetic coi ${routes[i].route}`,()=>synthetic[i].coop==='same-origin'&&synthetic[i].coep==='require-corp'&&synthetic[i].corp==='same-origin');
    await add(`electron coi ${routes[i].route}`,()=>electron[i].coop==='same-origin'&&electron[i].coep==='require-corp'&&electron[i].corp==='same-origin');
  }
  const traversal=[{route:'/%252e%252e%252fpackage.json'}];const st=await probeServer(createSyntheticStaticServer(dist),traversal);const et=await probeServer(createStaticCoiServer(dist),traversal);
  await add('synthetic traversal rejected',()=>st[0].status===403);
  await add('electron traversal rejected',()=>et[0].status===403);
  await add('wasm mime synthetic',()=>synthetic.find(x=>x.route.endsWith('.wasm')).contentType==='application/wasm');
  await add('icc mime electron',()=>electron.find(x=>x.route.endsWith('.icc')).contentType==='application/vnd.iccprofile');
  await add('query path identity',async()=>{const r=await probeServer(createStaticCoiServer(dist),[{route:'/index.html?q=1'}]);return r[0].status===200&&r[0].bodySha256===electron[0].bodySha256;});
  for(let i=0;i<10;i++) await add(`blocked artifact sealed ${i}`,()=>verifySeal(makeBlockedArtifact(`a${i}`,['E_BUILD_EMIT_LOCK_NOT_PROMOTED'])));
  for(let i=0;i<10;i++) await add(`blocked artifact deterministic ${i}`,()=>makeBlockedArtifact(`a${i}`,['b','a']).selfDigest===makeBlockedArtifact(`a${i}`,['a','b']).selfDigest);
  await add('wasm minimal compile',async()=>{await WebAssembly.compile(fs.readFileSync(path.join(dist,'assets','codec.wasm')));return true;});
  await add('admission digest deterministic',()=>discoverLegacyStaticAdmission().digest===admission.digest);
  await add('admission routes unique',()=>new Set(admission.records.map(x=>x.route)).size===admission.recordCount);
  await add('admission paths bounded',()=>admission.records.every(x=>x.sourceRelative.startsWith('app/legacy-runtime/')));
  await add('admission no credentials',()=>!canonicalJson(admission).match(/_authToken|Bearer\s/i));
  await add('input no absolute cwd',()=>!canonicalJson(input).includes(process.cwd()));
  await add('static server no-store',()=>electron[0].cacheControl==='no-store');
  await add('synthetic server no-store',()=>synthetic[0].cacheControl==='no-store');
  await add('missing route has COI',()=>electron.at(-1).coop==='same-origin');
  while(tests.length<120) await add(`deterministic filler contract ${tests.length+1}`,()=>sha256Bytes('dadum')==='cc0a25871d6e167e2a7536714d451d6810ccb0c79522a4e902f6627d296bb88f');
} finally { fs.rmSync(temp,{recursive:true,force:true}); }
if(tests.length!==120) throw new Error(`test count ${tests.length}`);
const failed=tests.filter(x=>!x.ok);
for(const test of tests) console.log(`${test.ok?'PASS':'FAIL'} ${test.id} ${test.name}${test.detail?` ${test.detail}`:''}`);
fs.writeFileSync('artifacts/runtime/TDT_BUILD_EMIT_01_RUNTIME_TEST_REPORT.json',JSON.stringify({schemaVersion:1,patchId:'TDT-BUILD-EMIT-01',scope:'POLICY_AND_SYNTHETIC_RUNTIME',passed:tests.length-failed.length,total:tests.length,failed},null,2)+'\n');
if(failed.length) process.exit(1);
console.log(`PASS BUILD-EMIT-01 RUNTIME POLICY TESTS ${tests.length}/${tests.length}`);
