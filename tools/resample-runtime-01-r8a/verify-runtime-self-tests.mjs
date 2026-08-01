import {pathToFileURL} from 'node:url';
import {abs,check,read,sourceArtifact,seal} from './lib.mjs';
const webp=await import(pathToFileURL(abs('app/legacy-runtime/encoders/webp_api_forced.js')).href+`?r8a=${Date.now()}`);
for(const name of ['ensureWebPReady','encodeRGBAtoWebP','encodeRGBAtoWebPLossless','encodeLosslessRGBA','WebP'])check(name in webp,'E_R8A_WEBP_ADAPTER_SURFACE_MISSING',`WebP adapter export missing: ${name}`);
const webpSource=read('app/legacy-runtime/encoders/webp_api_forced.js');
check(!/\bdocument\b|querySelector|getContext\s*\(|toDataURL|toBlob\s*\(/.test(webpSource),'E_R8A_WEBP_IMPORT_SIDE_EFFECT','WebP adapter contains DOM or canvas path');
check(!/^[\t ]*return\s*;/m.test(webpSource),'E_R8A_WEBP_TOP_LEVEL_RETURN','WebP adapter contains bare top-level return');
const bridgeRecords=[];let live=0;
function bridge(name){let active=null;return {name,registerRecoveryParticipant(participant){check(!active,'E_R8A_RECOVERY_PARTICIPANT_LEAK','duplicate participant');active=participant;live+=1;bridgeRecords.push(participant);return ()=>{if(active){active=null;live-=1;}};},invalidate(){check(active,'E_R8A_RECOVERY_PARTICIPANT_MISSING','participant missing');active.invalidate();}};}
const recovery=await import(pathToFileURL(abs('app/legacy-runtime/modules/dk_resample/export_state_recovery_r8a.mjs')).href+`?r8a=${Date.now()}`);
const authority=recovery.createRepeatedLossStateAuthority();
const firstBridge=bridge('first');authority.bindBridge(firstBridge);const disposed=[];
for(let cycle=1;cycle<=3;cycle++){const state={disposed:false,dispose(){check(!this.disposed,'E_R8A_STATE_DOUBLE_DISPOSE','state disposed twice');this.disposed=true;disposed.push(cycle);}};authority.installState(state);firstBridge.invalidate();check(state.disposed,'E_R8A_STATE_NOT_DISPOSED','loss did not dispose current state');check(authority.snapshot().participantCount===1,'E_R8A_RECOVERY_PARTICIPANT_LEAK','participant count is not one');}
const secondBridge=bridge('second');authority.bindBridge(secondBridge);check(live===1,'E_R8A_RECOVERY_PARTICIPANT_LEAK','old bridge participant was not removed');
const fourth={disposed:false,dispose(){this.disposed=true;disposed.push(4);}};authority.installState(fourth);secondBridge.invalidate();check(fourth.disposed,'E_R8A_STATE_NOT_DISPOSED','replacement bridge did not invalidate current state');
const recoverySnapshot=authority.snapshot();check(recoverySnapshot.recoveryGeneration===4&&recoverySnapshot.disposeCount===4,'E_R8A_REPEATED_LOSS_COUNT_MISMATCH','repeated loss counts mismatch',recoverySnapshot);authority.dispose();check(live===0,'E_R8A_RECOVERY_PARTICIPANT_LEAK','participant remained after authority dispose');
const compatibility=await import(pathToFileURL(abs('app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs')).href+`?r8a=${Date.now()}`);
const fixture={kernelId:'tdt.ewa.ellipse.phase-correct-parametric-r6.v1',kernelContractId:'tdt.ewa.kernel-contract.v4',kernelContractDigest:'18d413d630172515d463e6598d9f9e90c6a221c1fca41824defeae3e19da8909',parameterAbiId:'tdt.delta-k-ewa.params.v4',plannerId:'tdt.ewa.multistage.planner.v3',planDigest:'1'.repeat(64),bundleIdentity:{generatedManifestId:'tdt.ewa.generated-manifest.r8.v1',generatedManifestDigest:'2'.repeat(64),generatedOutputs:[{outputDigest:'3'.repeat(64)},{outputDigest:'4'.repeat(64)}]}};
const derived=await compatibility.deriveActualResampleIdentityR8A(fixture);check(derived.actualIdentity.kernelId===fixture.kernelId&&derived.actualIdentity.shaderDigestSet.length===2&&derived.actualIdentityDigest.length===64,'E_R8A_IDENTITY_PROPAGATION_FAILED','actual identity derivation failed');
let forgedRejected=false;try{await compatibility.deriveActualResampleIdentityR8A({...fixture,kernelId:''});}catch(error){forgedRejected=error?.code==='E_R8A_EXECUTED_IDENTITY_MISSING';}check(forgedRejected,'E_R8A_CALLER_FORGED_IDENTITY_ACCEPTED','missing actual kernel identity was accepted');
const report=seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R8A',pass:true,webpAdapterExports:['ensureWebPReady','encodeRGBAtoWebP','encodeRGBAtoWebPLossless','encodeLosslessRGBA','WebP'],webpImportTimeDomQueryCount:0,repeatedDeviceLossCyclesPassed:3,bridgeReplacementPassed:true,participantCountPlateau:1,recoverySnapshot,actualKernelIdentityPropagated:true,shaderDigestCount:derived.actualIdentity.shaderDigestSet.length,identityDigest:derived.actualIdentityDigest});
sourceArtifact('R8A_RUNTIME_MODULE_SELF_TEST.json',report);
console.log('PASS R8A runtime module self tests');
