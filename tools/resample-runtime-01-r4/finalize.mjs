import fs from 'node:fs';import path from 'node:path';import { ROOT, ARTIFACT_DIR, R4_FILES, PARENT_ZIP_SHA256, COORDINATE_CONVENTION_ID, PRODUCT_COORDINATE_ID, TILE_COVERAGE_PROOF_ID, PROFILE_SCHEMA_ID, PARAMETER_ABI_ID, PARAMETER_BYTES, sha256File, canonicalJson, sha256, writeJson } from './lib.mjs';const gate=JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIR,'TDT_RESAMPLE_RUNTIME_01_R4_SOURCE_GATE.json'),'utf8'));if((gate.failCount??0)!==0)process.exit(1);const pointer='artifacts/active-graph-01/source-bake/production-pointer-conservation.json';const receipt={schemaVersion:1,schemaId:'tdt.ewa.resample-runtime-r4.source-receipt.v1',patchId:'TDT-RESAMPLE-RUNTIME-01-R4',parentPatchId:'TDT-RESAMPLE-RUNTIME-01-R3',parentBundleSha256:PARENT_ZIP_SHA256,coordinateConventionId:COORDINATE_CONVENTION_ID,productCoordinateId:PRODUCT_COORDINATE_ID,tileCoverageProofId:TILE_COVERAGE_PROOF_ID,profileSchemaId:PROFILE_SCHEMA_ID,parameterAbiId:PARAMETER_ABI_ID,parameterBytes:PARAMETER_BYTES,r2AssetsPreserved:true,r3EvidencePreserved:true,canonicalRuntimeUsesR4:true,runtimeCpuFallbackCount:0,referenceAsProductFallbackCount:0,productionPointerMutated:false,productionPointerDigest:sha256File(pointer),physicalGpuExecuted:false,physicalGpuStatus:'DEFERRED_TO_R9',packagedElectronStatus:'DEFERRED',shaderDigests:Object.fromEntries(Object.entries(R4_FILES).filter(([key])=>['productR4','productR6','validationR4','validationR6','reference'].includes(key)).map(([key,relative])=>[key,sha256File(relative)])),status:'RESAMPLE_RUNTIME_R4_PHASE_CORRECT_PRODUCT_REFERENCE_REPAIRED_AWAITING_R5'};receipt.receiptDigest=sha256(canonicalJson(receipt));writeJson('TDT_RESAMPLE_RUNTIME_01_R4_SOURCE_RECEIPT.json',receipt);const readme=`# TDT-RESAMPLE-RUNTIME-01-R4 APPLIED

State: \`${receipt.status}\`

- Continuous source lattice: \`${COORDINATE_CONVENTION_ID}\`
- Candidate base: \`floor(p)\`
- Candidate coordinate: \`base + integerOffset\`
- Exact distance: \`sampleCoord - p\`
- Border clamp applies only to physical fetch.
- Product shaders use strict shared-tile reads with no direct-load fallback.
- Partial workgroups use the last active destination coordinate.
- R2 assets and R3 oracle evidence remain immutable.
- Physical GPU parity and packaged Electron execution remain deferred.

Gate: ${gate.counts.PASS} PASS / ${gate.counts.DEFERRED} DEFERRED / ${gate.counts.FAIL??0} FAIL.
`;fs.writeFileSync(path.join(ROOT,'README_TDT_RESAMPLE_RUNTIME_01_R4_APPLIED.md'),readme);console.log(receipt.status);
