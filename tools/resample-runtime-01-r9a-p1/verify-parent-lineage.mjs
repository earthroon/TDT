import {capture,check,sha256File,json,sourceArtifact,seal,verifySelf} from './lib.mjs';import {PARENT_RECEIPT,PARENT_RECEIPT_SHA256,PARENT_RECEIPT_SELF_SHA256,PACKAGE_LOCK_SHA256,POINTER_A,POINTER_B,POINTER_SHA256,PARENT_BUNDLE_SHA256} from './identity.mjs';
const tests=[
 capture('R9AP1-PARENT-RECEIPT-FILE',()=>check(sha256File(PARENT_RECEIPT)===PARENT_RECEIPT_SHA256,'E_R9AP1_PARENT_MISMATCH','Build Lock R2 receipt bytes mismatch')),
 capture('R9AP1-PARENT-RECEIPT-SELF',()=>{const r=json(PARENT_RECEIPT);check(verifySelf(r)&&r.selfSha256===PARENT_RECEIPT_SELF_SHA256,'E_R9AP1_PARENT_MISMATCH','Build Lock R2 receipt self hash mismatch');return r.state;}),
 capture('R9AP1-PACKAGE-LOCK-FREEZE',()=>check(sha256File('package-lock.json')===PACKAGE_LOCK_SHA256,'E_R9AP1_PACKAGE_LOCK_MUTATED','package-lock changed during source bake')),
 capture('R9AP1-POINTER-A-FREEZE',()=>check(sha256File(POINTER_A)===POINTER_SHA256,'E_R9AP1_POINTER_MUTATED','Production Pointer A changed')),
 capture('R9AP1-POINTER-B-FREEZE',()=>check(sha256File(POINTER_B)===POINTER_SHA256,'E_R9AP1_POINTER_MUTATED','Production Pointer B changed')),
];
const failCount=tests.filter(x=>x.status==='FAIL').length;sourceArtifact('R9AP1_PARENT_FREEZE_REPORT.json',seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R9A-P1',parentBundleSha256:PARENT_BUNDLE_SHA256,passCount:tests.length-failCount,failCount,tests}));check(failCount===0,'E_R9AP1_PARENT_MISMATCH','parent freeze failed',{tests});console.log('R9A-P1 parent and pointer freeze PASS');
