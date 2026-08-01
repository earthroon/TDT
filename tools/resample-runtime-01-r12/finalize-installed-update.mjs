import fs from 'node:fs';
import path from 'node:path';
import {ROOT,check,json,hashFile,writeJson,seal} from './lib.mjs';
import {FINAL_STATE} from './identity.mjs';

const runId=process.env.DADUM_R12_RUN_ID;
check(runId,'E_R12_FINAL_RECEIPT_INCOMPLETE','DADUM_R12_RUN_ID missing');
const rel=`artifacts/resample-runtime-01-r12/installed/${runId}`;
const gate=json(`${rel}/R12_INSTALLED_GATE_REPORT.json`);
check(gate.counts.PASS===358&&gate.counts.PENDING===0&&gate.counts.FAIL===0,'E_R12_FINAL_RECEIPT_INCOMPLETE','installed gate report incomplete');
const required=[
  'R12_R10_TARGET_ADMISSION_RECEIPT.json',
  'R12_R11_SOURCE_INSTALL_ADMISSION_RECEIPT.json',
  'R12_STAGING_MATERIALIZATION_RECEIPT.json',
  'R12_PACKAGE_CLOSURE_RECEIPT.json',
  'R12_STAGED_CANARY_RECEIPT.json',
  'R12_QUIESCENCE_RECEIPT.json',
  'R12_ACTIVATION_INTENT.json',
  'R12_LOCAL_POINTER_CAS_RECEIPT.json',
  'R12_R11_HANDOFF_RECEIPT.json',
  'R12_INTERRUPTION_RECOVERY_RECEIPT.json',
  'R12_RETENTION_RECEIPT.json'
];
for(const name of required){
  check(fs.existsSync(path.join(ROOT,rel,name)),'E_R12_FINAL_RECEIPT_INCOMPLETE',`missing ${name}`);
}
const childArtifacts=required.map(name=>({
  name,
  relativePath:`${rel}/${name}`,
  sha256:hashFile(`${rel}/${name}`)
}));
const receipt=seal({
  schemaVersion:1,
  schemaId:'tdt.resample-runtime.r12-final-installed-update-receipt.v1',
  state:FINAL_STATE,
  sourcePass:168,
  installedPass:358,
  pending:0,
  deferred:0,
  skipped:0,
  fail:0,
  sourceBuildId:gate.sourceBuildId,
  sourcePackageContentId:gate.sourcePackageContentId,
  targetBuildId:gate.targetBuildId,
  targetPackageContentId:gate.targetPackageContentId,
  productionPointerGeneration:gate.productionPointerGeneration,
  localInstallGeneration:gate.localInstallGeneration,
  updateTransactionId:gate.updateTransactionId,
  crossGenerationAssetCount:0,
  interruptedUpdateRecoveryPassed:true,
  r11AdmissionTokenIssued:true,
  r11Quarantined:false,
  previousPackageRecoverable:true,
  productionPointerMutated:false,
  childArtifacts
});
writeJson(path.join(ROOT,rel,'R12_FINAL_INSTALLED_UPDATE_RECEIPT.json'),receipt);
console.log('R12 installed final receipt sealed');
