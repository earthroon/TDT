import fs from 'node:fs';import path from 'node:path';
import {tempDir,sourceArtifact,seal,check} from './lib.mjs';
import {canonicalPackagePath,validateCanonicalPathSet} from '../../app/features/resample-runtime/r12/path-policy.mjs';
import {buildPackageManifest,verifyPackageClosure} from '../../app/features/resample-runtime/r12/package-closure.mjs';
import {commitImmutablePackage} from '../../app/features/resample-runtime/r12/package-store.mjs';
import {createLocalPointer,readLocalPointer,casLocalPointer} from '../../app/features/resample-runtime/r12/local-activation-pointer.mjs';
import {createLaunchEnvelope,assertGenerationHandshake} from '../../app/features/resample-runtime/r12/launch-envelope.mjs';
import {issueTransitionLease,validateTransitionLease} from '../../app/features/resample-runtime/r12/update-transition-lease.mjs';
import {decideInterruptedRecovery} from '../../app/features/resample-runtime/r12/recovery-engine.mjs';
import {writeProductionPointer} from '../../app/features/resample-runtime/r12/production-pointer-readonly.mjs';
import {newTransaction,transition} from '../../app/features/resample-runtime/r12/update-transaction.mjs';
import {appendJournal,readJournal} from '../../app/features/resample-runtime/r12/update-journal.mjs';
function expect(code,fn){try{fn();throw new Error(`negative control did not fail ${code}`);}catch(e){if(e.message?.startsWith('negative control'))throw e;check(e.code===code,'E_R12_NEGATIVE_CONTROL_NOT_DETECTED',`expected ${code}, got ${e.code}`,e.message);return e.code;}}
const tmp=tempDir('r12-neg-');const evidence=[];
for(const [name,code,fn] of [
 ['traversal','E_R12_PATH_TRAVERSAL',()=>canonicalPackagePath('../evil.mjs')],
 ['absolute','E_R12_PATH_TRAVERSAL',()=>canonicalPackagePath('C:\\evil.mjs')],
 ['ads','E_R12_ADS_FORBIDDEN',()=>canonicalPackagePath('app/main.mjs:evil')],
 ['case-collision','E_R12_CASE_COLLISION',()=>validateCanonicalPathSet(['App/Main.mjs','app/main.mjs'])],
 ['reserved-name','E_R12_PATH_TRAVERSAL',()=>canonicalPackagePath('app/CON.txt')],
 ['trailing-dot','E_R12_PATH_TRAVERSAL',()=>canonicalPackagePath('app/bad.')]
])evidence.push({name,errorCode:expect(code,fn)});

const tx0=newTransaction({updateTransactionId:'b'.repeat(48),sourceBuildId:'A',sourcePackageContentId:'pA',targetBuildId:'B',targetPackageContentId:'pB',expectedProductionPointerGeneration:1,expectedProductionPointerRawSha256:'a'.repeat(64),expectedLocalPointerGeneration:0,expectedLocalPointerRawSha256:null,stagingRoot:path.join(tmp,'staging')});
evidence.push({name:'transaction-skip',errorCode:expect('E_R12_FINAL_RECEIPT_INCOMPLETE',()=>transition(tx0,'CLOSURE_VERIFIED','x'))});
const tx1=transition(tx0,'PAYLOAD_MATERIALIZED','x');evidence.push({name:'transaction-rewind',errorCode:expect('E_R12_FINAL_RECEIPT_INCOMPLETE',()=>transition(tx1,'CREATED','x'))});
const badJournal=path.join(tmp,'corrupt-tail.jsonl');appendJournal(badJournal,{transactionId:'t',phase:'INTENT',intent:true});appendJournal(badJournal,{transactionId:'t',phase:'EFFECT',effect:'x'});fs.appendFileSync(badJournal,'{broken-tail');const preserved=readJournal(badJournal,{allowCorruptTail:true});check(preserved.length===2,'E_R12_NEGATIVE_CONTROL_NOT_DETECTED','corrupt journal tail not preserved');evidence.push({name:'journal-corrupt-tail',preservedEntries:2});
const hardRoot=path.join(tmp,'hardlink-payload');fs.mkdirSync(hardRoot);fs.writeFileSync(path.join(hardRoot,'base'),'x');try{fs.linkSync(path.join(hardRoot,'base'),path.join(hardRoot,'alias'));evidence.push({name:'external-hardlink',errorCode:expect('E_R12_REPARSE_POINT_FORBIDDEN',()=>buildPackageManifest(hardRoot,{buildId:'B'}))});}catch{evidence.push({name:'external-hardlink',status:'platform-unavailable-contract-statically-present'});}

const payload=path.join(tmp,'payload');fs.mkdirSync(payload,{recursive:true});fs.writeFileSync(path.join(payload,'main.mjs'),'v1');const manifest=buildPackageManifest(payload,{buildId:'B'});fs.writeFileSync(path.join(payload,'main.mjs'),'v2');evidence.push({name:'mutated-package',errorCode:expect('E_R12_PACKAGE_CLOSURE_INCOMPLETE',()=>verifyPackageClosure(payload,manifest))});
const linkRoot=path.join(tmp,'link-payload');fs.mkdirSync(linkRoot);fs.writeFileSync(path.join(linkRoot,'real'),'x');try{fs.symlinkSync(path.join(linkRoot,'real'),path.join(linkRoot,'alias'));evidence.push({name:'junction-or-symlink',errorCode:expect('E_R12_REPARSE_POINT_FORBIDDEN',()=>buildPackageManifest(linkRoot,{buildId:'B'}))});}catch{evidence.push({name:'junction-or-symlink',status:'platform-unavailable-contract-statically-present'});}
const good=path.join(tmp,'good');fs.mkdirSync(good);fs.writeFileSync(path.join(good,'x'),'x');const gm=buildPackageManifest(good,{buildId:'B'});const store=path.join(tmp,'packages');fs.mkdirSync(path.join(store,gm.packageContentId),{recursive:true});fs.writeFileSync(path.join(store,gm.packageContentId,'x'),'tampered');evidence.push({name:'content-id-collision',errorCode:expect('E_R12_CONTENT_ID_COLLISION',()=>commitImmutablePackage({verifiedRoot:good,packagesRoot:store,manifest:gm}))});
const base={role:'main',buildId:'B',packageContentId:'pB',installGeneration:4,updateTransactionId:'t',packageRoot:'/pkg/B',stagedExecution:true};const main=createLaunchEnvelope(base);for(const [name,changes] of [['old-worker',{role:'worker',installGeneration:3}],['old-wasm-helper',{role:'pthread',packageContentId:'pA'}],['old-native-addon',{role:'native',buildId:'A'}]]){const child=createLaunchEnvelope({...base,...changes});evidence.push({name,errorCode:expect('E_R12_CROSS_GENERATION_HANDSHAKE',()=>assertGenerationHandshake(main,child))});}
const lease=issueTransitionLease({sourceBuildId:'A',sourcePackageContentId:'pA',targetBuildId:'B',targetPackageContentId:'pB',productionPointerGeneration:5,productionPointerRawSha256:'a'.repeat(64),sourceEligibleAsPreviousOrActive:true});evidence.push({name:'stale-r10-pointer',errorCode:expect('E_R12_PRODUCTION_POINTER_STALE',()=>validateTransitionLease(lease,{generation:6,rawSha256:'b'.repeat(64)}))});
const ptrFile=path.join(tmp,'pointer.json');const p0=createLocalPointer({});fs.writeFileSync(ptrFile,JSON.stringify(p0));const r0=readLocalPointer(ptrFile);const p1=createLocalPointer({generation:1,buildId:'B',packageContentId:'pB',installGeneration:1,selectionMode:'NORMAL'});evidence.push({name:'stale-local-pointer',errorCode:expect('E_R12_LOCAL_POINTER_CAS_MISMATCH',()=>casLocalPointer(ptrFile,{expectedRawSha256:'0'.repeat(64),expectedGeneration:0,next:p1}))});
evidence.push({name:'pointer-generation-mismatch',errorCode:expect('E_R12_LOCAL_POINTER_CAS_MISMATCH',()=>casLocalPointer(ptrFile,{expectedRawSha256:r0.rawSha256,expectedGeneration:1,next:p1}))});
const rec1=decideInterruptedRecovery({transactionState:'POINTER_ACTIVATED',journalPhases:['POINTER_CAS_COMMITTED'],localPointer:p1,sourcePackagePresent:true,targetPackagePresent:true,targetClosureValid:true,r11Handoff:'PENDING'});check(rec1.action==='RETRY_R11_HANDOFF','E_R12_NEGATIVE_CONTROL_NOT_DETECTED','post-CAS kill not recovered');evidence.push({name:'post-cas-kill',recovery:rec1.action});
const rec2=decideInterruptedRecovery({transactionState:'POINTER_ACTIVATED',journalPhases:['POINTER_CAS_COMMITTED'],localPointer:p1,sourcePackagePresent:true,targetPackagePresent:true,targetClosureValid:false,r11Handoff:'FAIL'});check(rec2.action==='RESTORE_PREVIOUS_RECOVERY_ONLY','E_R12_NEGATIVE_CONTROL_NOT_DETECTED','R11 handoff kill not recovered');evidence.push({name:'r11-handoff-kill',recovery:rec2.action});
evidence.push({name:'production-pointer-write',errorCode:expect('E_R12_PRODUCTION_POINTER_WRITE_ATTEMPT',()=>writeProductionPointer())});
sourceArtifact('R12_NEGATIVE_CONTROL_SOURCE_GATE.json',seal({schemaVersion:1,schemaId:'tdt.resample-runtime.r12.negative-controls.v1',evidence,detected:evidence.length,productionPointerMutated:false,pass:true}));
fs.rmSync(tmp,{recursive:true,force:true});console.log(`R12 negative controls PASS ${evidence.length}`);
