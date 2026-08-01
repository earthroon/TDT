import {sourceArtifact,seal,check} from './lib.mjs';
import {validateSmoke} from './smoke-contract.mjs';
import {createLineageRestoration,verifyLineageRestoration} from './lineage-restoration.mjs';
import {FINAL_RELEASE_STATE} from './identity.mjs';
const pkg=seal({schemaVersion:1,schemaId:'tdt.resample.qualified-package.r10a.v1',buildId:'target',packageContentId:'a'.repeat(64),runtimeClosureDigest:'b'.repeat(64)});
const smoke=validateSmoke({buildId:pkg.buildId,packageContentId:pkg.packageContentId,runtimeClosureDigest:pkg.runtimeClosureDigest,previewPass:true,strictExportPass:true,canonicalJobEncoderCount:1,canonicalJobSubmitCount:1,exportPreMapFenceCount:0,validationCounterTotal:0,cpuFallback:false,silentFallbackCount:0,pendingJobCount:0,packagePreSha256:'a'.repeat(64),packagePostSha256:'a'.repeat(64)},pkg,'FINAL');
const r8a=seal({patchId:'TDT-RESAMPLE-RUNTIME-01-R8A'}),r9s=seal({patchId:'TDT-RESAMPLE-RUNTIME-01-R9A-SOURCE'}),r9p=seal({patchId:'TDT-RESAMPLE-RUNTIME-01-R9A-PHYSICAL'}),r10=seal({patchId:'TDT-RESAMPLE-RUNTIME-01-R10A',state:FINAL_RELEASE_STATE});const lineage=createLineageRestoration({r8aSource:r8a,r9aSource:r9s,r9aPhysical:r9p,r10aRelease:r10});verifyLineageRestoration(lineage);check(lineage.nextReplay.length===3,'E_R10A_LINEAGE_FALSE_CURRENT','next replay count mismatch');
sourceArtifact('R10A_SMOKE_AND_LINEAGE_REPORT.json',seal({schemaVersion:1,pass:true,smokeReceiptSha256:smoke.selfSha256,lineageRootDigest:lineage.lineageRootDigest,lineageHead:lineage.lineageHead,nextReplay:lineage.nextReplay,productionPointerMutated:false}));
console.log('R10A smoke and lineage source PASS');
