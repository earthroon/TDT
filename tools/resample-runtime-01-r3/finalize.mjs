import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, PATCH_ID, PARENT_ZIP_SHA256, ROOT, canonicalJson, readJson, receiptDigest, sha256File, writeJson } from './lib.mjs';
const gate=JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIR,'TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_GATE.json'),'utf8'));
if(gate.failCount!==0)process.exit(1);
const changedManifestRelative='patches/TDT_RESAMPLE_RUNTIME_01_R3_CHANGED_FILE_MANIFEST.json';
const patchRelative='patches/TDT_RESAMPLE_RUNTIME_01_R3_independent_fractional_phase_ewa_oracle.diff';
const required=[
  'specs/TDT-RESAMPLE-RUNTIME-01-R3_INDEPENDENT_FRACTIONAL_PHASE_EWA_ORACLE_CONTINUOUS_SOURCE_LATTICE_COORDINATE_TRUTH_SHARED_PRODUCT_REFERENCE_ERROR_DETECTION_ROUND_CENTERED_NEGATIVE_CONTROL_ZERO_RUNTIME_CPU_FALLBACK_SEAL_SPEC.md',
  'README_TDT_RESAMPLE_RUNTIME_01_R3_APPLIED.md',changedManifestRelative,patchRelative,
  'fixtures/resample-runtime-01-r3/TDT_RESAMPLE_RUNTIME_01_R3_FIXTURE_MANIFEST.json','fixtures/resample-runtime-01-r3/sources/SOURCE_PAYLOAD_DIGESTS.json',
];
const changed=fs.existsSync(path.join(ROOT,changedManifestRelative))?readJson(changedManifestRelative):{changedFileCount:0,files:[]};
const receiptNames=['TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_IDENTITY.json','TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_SELF_TEST_RECEIPT.json','TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json','TDT_RESAMPLE_RUNTIME_01_R3_SHARED_ERROR_SOURCE_RECEIPT.json','TDT_RESAMPLE_RUNTIME_01_R3_CURRENT_PRODUCT_REJECTION_RECEIPT.json','TDT_RESAMPLE_RUNTIME_01_R3_ZERO_RUNTIME_CPU_FALLBACK_RECEIPT.json','TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_GATE.json','r3-source-contract.json','r3-runtime-smoke.json'];
const files=[...new Set([...required,...changed.files.filter((entry)=>entry.status!=='deleted').map((entry)=>entry.relative),...receiptNames.map((name)=>`artifacts/resample-runtime-01-r3/source-bake/${name}`)])].filter((relative)=>fs.existsSync(path.join(ROOT,relative))).sort();
const records=files.map((relative)=>({relative,byteLength:fs.statSync(path.join(ROOT,relative)).size,sha256:sha256File(relative)}));
const sourceSeal=receiptDigest({patchId:PATCH_ID,parentZipSha256:PARENT_ZIP_SHA256,records,gateCounts:gate.counts,verifiedState:gate.state});
const receipt={schemaVersion:1,patchId:PATCH_ID,parentPatchId:'TDT-RESAMPLE-RUNTIME-01-R2',state:'RESAMPLE_RUNTIME_R3_ORACLE_BAKED_CURRENT_PRODUCT_REJECTED',verifiedState:'RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED',parentZipSha256:PARENT_ZIP_SHA256,sourceSealSha256:sourceSeal,changedFileCount:changed.changedFileCount,sealedFileCount:records.length,files:records,gateCounts:gate.counts,productionPointerMutated:false,physicalGpuClaims:false,packagedElectronClaims:false,productRepairPerformed:false,productPromoted:false,requiredRepairPatch:'TDT-RESAMPLE-RUNTIME-01-R4'};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_RECEIPT.json',receipt);
console.log(`PASS R3 source seal ${sourceSeal} changed=${changed.changedFileCount} sealed=${records.length}`);
