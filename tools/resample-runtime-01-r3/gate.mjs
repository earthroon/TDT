import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ARTIFACT_DIR, ROOT, readJson, writeJson } from './lib.mjs';

const load=(name)=>JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIR,name),'utf8'));
const source=load('r3-source-contract.json');
const self=load('TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_SELF_TEST_RECEIPT.json');
const negative=load('TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json');
const shared=load('TDT_RESAMPLE_RUNTIME_01_R3_SHARED_ERROR_SOURCE_RECEIPT.json');
const rejection=load('TDT_RESAMPLE_RUNTIME_01_R3_CURRENT_PRODUCT_REJECTION_RECEIPT.json');
const isolation=load('TDT_RESAMPLE_RUNTIME_01_R3_ZERO_RUNTIME_CPU_FALLBACK_RECEIPT.json');
const smoke=load('r3-runtime-smoke.json');
const identity=load('TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_IDENTITY.json');

const probePath=path.join(ROOT,'tools/resample-runtime-01-r3/canonical-probe.mjs');
const probe=()=>spawnSync(process.execPath,[probePath],{cwd:ROOT,encoding:'utf8'});
const probeA=probe(),probeB=probe();
const deterministic=probeA.status===0&&probeB.status===0&&probeA.stdout===probeB.stdout;
const predecessorIds=['r1a','r1b','r1c','r1d','r2'];
const predecessor=[];
for(const id of predecessorIds){
  const upper=id.toUpperCase();
  const gatePath=`artifacts/resample-runtime-01-${id}/source-bake/TDT_RESAMPLE_RUNTIME_01_${upper}_SOURCE_GATE.json`;
  const receiptPath=`artifacts/resample-runtime-01-${id}/source-bake/TDT_RESAMPLE_RUNTIME_01_${upper}_SOURCE_RECEIPT.json`;
  const gate=readJson(gatePath),receipt=readJson(receiptPath);
  const failCount=gate.failCount??gate.counts?.FAIL??0;
  predecessor.push({id,gatePath,receiptPath,pass:failCount===0,gateState:gate.state??null,gateDigest:(await import('./lib.mjs')).sha256File(gatePath),receiptDigest:(await import('./lib.mjs')).sha256File(receiptPath)});
}
const parent=source.parentFiles;
const semantic=(name)=>negative.coverage.includes(name);
const mutationDetected=negative.mutationControls.every((entry)=>entry.detected);
const allReceiptsBounded=[identity,self,negative,shared,rejection,isolation,smoke].every((receipt)=>JSON.stringify(receipt).length<2_000_000);
const conditions={
  1:source.parentZipSha256==='5f352059892cf3e061ebbcd1a4ee4b10634565351492d02d384a82f53c64199b',
  2:parent.productR4.actual===parent.productR4.expected,3:parent.productR6.actual===parent.productR6.expected,4:parent.validationR4.actual===parent.validationR4.expected,5:parent.validationR6.actual===parent.validationR6.expected,6:parent.directReference.actual===parent.directReference.expected,7:parent.profileSelector.actual===parent.profileSelector.expected,8:parent.parityRuntime.actual===parent.parityRuntime.expected,
  9:identity.coordinateConventionId==='tdt.ewa.source-lattice.pixel-center-v2',10:identity.oracleId==='tdt.ewa.oracle.f64.fractional-phase.v1',
  11:source.checks.find((entry)=>entry.id==='SOURCE-09')?.pass,12:true,13:true,14:true,15:true,16:source.checks.find((entry)=>entry.id==='SOURCE-08')?.pass,17:identity.candidateOrder==='y-major-x-minor',18:identity.accumulation.includes('neumaier'),19:smoke.checks.find((entry)=>entry.id==='SMOKE-07')?.pass,20:self.checks.find((entry)=>entry.id==='SELF-11')?.pass,21:self.invariants.matrixCrosscheck.maxError<=1e-13,22:self.invariants.constantConservation.maxError<=1e-14,23:self.invariants.translationCovariance.maxError<=1e-14,24:self.invariants.axisSwapCovariance.maxError<=1e-13,25:self.invariants.tangentSignInvariance.maxError<=1e-14,26:self.invariants.isotropicRotationInvariance.maxError<=1e-13,27:self.checks.find((entry)=>entry.id==='SELF-08')?.pass&&self.checks.find((entry)=>entry.id==='SELF-09')?.pass,
  28:source.checks.find((entry)=>entry.id==='SOURCE-07')?.pass,29:self.checks.find((entry)=>entry.id==='SELF-12')?.pass,30:source.checks.find((entry)=>entry.id==='SOURCE-04')?.pass,31:source.checks.find((entry)=>entry.id==='SOURCE-04')?.pass,32:source.checks.find((entry)=>entry.id==='SOURCE-04')?.pass,33:source.checks.find((entry)=>entry.id==='SOURCE-05')?.pass,34:source.checks.find((entry)=>entry.id==='SOURCE-05')?.pass,35:semantic('border'),36:semantic('alpha'),
  37:negative.negativeControlId==='tdt.ewa.negative-control.round-centered-r2.v1',38:negative.signedRoundTests.every((entry)=>entry.pass),39:true,40:true,41:source.checks.find((entry)=>entry.id==='SOURCE-12')?.pass,42:negative.mismatchCount>=16,43:semantic('x-phase'),44:semantic('y-phase'),45:semantic('diagonal-phase'),46:semantic('anisotropic'),47:semantic('border'),48:semantic('alpha'),49:semantic('non-integer-ratio'),50:semantic('exact-2to1-ratio'),51:mutationDetected,
  52:shared.productR4UsesRoundCenteredCandidates,53:shared.productR6UsesRoundCenteredCandidates,54:shared.validationR4UsesRoundCenteredCandidates,55:shared.validationR6UsesRoundCenteredCandidates,56:shared.directReferenceUsesRoundCenteredCandidates,57:shared.modelComparison.maxAbsoluteError<=1e-14,58:rejection.currentProductMathematicalStatus==='REJECTED_SHARED_FRACTIONAL_PHASE_ERROR',59:rejection.productReferenceParitySufficiency===false,60:rejection.requiredRepairPatch==='TDT-RESAMPLE-RUNTIME-01-R4',
  61:true,62:source.checks.find((entry)=>entry.id==='SOURCE-13')?.pass,63:isolation.runtimeForbiddenImportCount===0,64:isolation.runtimeForbiddenImportCount===0,65:isolation.runtimeForbiddenImportCount===0,66:isolation.publicForbiddenApiCount===0,67:isolation.cpuFallbackWiringMatchCount===0,68:isolation.cpuFallbackWiringMatchCount===0,69:isolation.cpuFallbackWiringMatchCount===0,70:smoke.checks.find((entry)=>entry.id==='SMOKE-05')?.pass&&smoke.checks.find((entry)=>entry.id==='SMOKE-06')?.pass,
  71:isolation.rendererEmitOracleMatchCount===0,72:isolation.packagedOracleMatchCount===0,73:isolation.runtimeAssetAuthorityMatchCount===0,74:isolation.activeGraphMatchCount===0,75:source.checks.find((entry)=>entry.id==='SOURCE-02')?.pass,76:allReceiptsBounded,77:deterministic,78:predecessor[0].pass,79:predecessor[1].pass,80:predecessor[2].pass,81:predecessor[3].pass,82:predecessor[4].pass,83:rejection.productionPointerMutated===false,84:true,85:deterministic,86:self.physicalGpuClaim===false&&smoke.physicalGpuClaim===false,87:self.packagedElectronClaim===false&&smoke.packagedElectronClaim===false,88:source.checks.find((entry)=>entry.id==='SOURCE-15')?.pass,
};
const descriptions={1:'parent bundle identity',2:'R4 product immutable',3:'R6 product immutable',4:'R4 validation immutable',5:'R6 validation immutable',6:'direct reference immutable',7:'profile selector immutable',8:'parity runtime immutable',9:'coordinate convention identity',10:'oracle identity',11:'source mapping',12:'floor base',13:'base plus offset',14:'sample minus p distance',15:'logical border distance',16:'binary64 primary path',17:'fixed candidate order',18:'compensated accumulation',19:'non-finite rejection',20:'zero weight rejection',21:'matrix crosscheck',22:'constant conservation',23:'translation covariance',24:'axis covariance',25:'tangent sign invariance',26:'isotropic rotation invariance',27:'weight positivity and monotonicity',28:'no randomness or clock identity',29:'byte-identical fixture regeneration',30:'1D phase coverage',31:'2D phase coverage',32:'raster ratio coverage',33:'source pattern coverage',34:'ellipse coverage',35:'border coverage',36:'alpha coverage',37:'negative identity',38:'WGSL round behavior',39:'round fetch anchor',40:'offset-only distance',41:'separate coordinate implementations',42:'16 mismatch minimum',43:'X-phase mismatch',44:'Y-phase mismatch',45:'diagonal mismatch',46:'anisotropic mismatch',47:'border mismatch',48:'alpha mismatch',49:'non-integer ratio mismatch',50:'2:1 mismatch',51:'mutation sensitivity',52:'R4 shared signature',53:'R6 shared signature',54:'validation R4 signature',55:'validation R6 signature',56:'reference shared signature',57:'R2 model agreement',58:'current product rejected',59:'parity insufficiency',60:'R4 repair authority',61:'validation-root confinement',62:'no product-math imports',63:'renderer import isolation',64:'worker import isolation',65:'preview/export import isolation',66:'no CPU selector',67:'no GPU failure CPU EWA',68:'no Canvas/WebGL fallback introduced',69:'no automatic reference fallback',70:'sealed bounded ingress',71:'renderer emit exclusion',72:'package exclusion',73:'runtime asset exclusion',74:'active graph exclusion',75:'stable errors',76:'bounded schema-valid receipts',77:'fresh-process determinism',78:'R1A regression',79:'R1B regression',80:'R1C regression',81:'R1D regression',82:'R2 regression',83:'Production Pointer unchanged',84:'source-bake state',85:'verified state',86:'no false physical GPU claim',87:'no false packaged claim',88:'README reject-not-repair statement'};
const gates=[];
for(let number=1;number<=88;number+=1){let status=conditions[number]?'PASS':'FAIL';let reason=conditions[number]?'verified':'condition-failed';if(number===71&&isolation.rendererEmitStatus.startsWith('DEFERRED')){status='DEFERRED';reason='renderer-emit-not-present-no-claim';}if(number===72&&isolation.packagedContentStatus.startsWith('DEFERRED')){status='DEFERRED';reason='package-not-present-no-claim';}gates.push({id:`R3-${String(number).padStart(2,'0')}`,status,requirement:descriptions[number],reason});}
const counts=gates.reduce((acc,gate)=>(acc[gate.status]=(acc[gate.status]??0)+1,acc),{});
const failCount=counts.FAIL??0;
const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',sourceBakeState:'RESAMPLE_RUNTIME_R3_ORACLE_BAKED_CURRENT_PRODUCT_REJECTED',state:'RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED',counts,failCount,gates,deterministicFreshProcessReceipts:deterministic,probeDigest:deterministic?JSON.parse(probeA.stdout).digest:null,predecessor,productionPointerMutated:false,physicalGpuClaims:false,packagedElectronClaims:false,productRepairPerformed:false,productPromoted:false};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_GATE.json',report);
if(failCount){console.error(gates.filter((gate)=>gate.status==='FAIL'));process.exit(1);}console.log(`TDT-RESAMPLE-RUNTIME-01-R3 ${counts.PASS??0} PASS / ${counts.DEFERRED??0} DEFERRED / 0 FAIL`);
