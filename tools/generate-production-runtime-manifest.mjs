import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, ROOT, canonicalJson, readJson, seal, sha256Bytes, writeJson } from './build-emit-01-lib.mjs';
const dist=path.join(ROOT,'dist','renderer');
const inputs={
  source:path.join(ROOT,'artifacts','runtime','generated-runtime-manifest.source.json'),
  input:path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_BUILD_INPUT_MANIFEST.json'),
  worker:path.join(dist,'dadum-runtime-worker-manifest.json'),
  vite:path.join(dist,'dadum-vite-entry-manifest.json'),
  admission:path.join(ROOT,'app','src','legacy','generated-legacy-static-admission.json'),
  route:path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_STATIC_ROUTE_MANIFEST.json'),
  repro:path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_BUILD_REPRODUCIBILITY_RECEIPT.json'),
};
for(const [name,file] of Object.entries(inputs)) if(!fs.existsSync(file)) throw new Error(`E_PRODUCTION_RUNTIME_MANIFEST_INVALID:${name}`);
const source=readJson(inputs.source), input=readJson(inputs.input), worker=readJson(inputs.worker), vite=readJson(inputs.vite), admission=readJson(inputs.admission), route=readJson(inputs.route), repro=readJson(inputs.repro);
const rendererBuildId=sha256Bytes(canonicalJson({sourceBuildId:source.buildId,buildInputManifestDigest:input.selfDigest,viteEntryManifestDigest:vite.digest,emittedWorkerManifestDigest:worker.manifestDigest,legacyStaticAdmissionManifestDigest:admission.digest,staticRouteManifestDigest:route.digest,buildReproducibilityReceiptDigest:repro.selfDigest})).slice(0,24);
const payload=seal({...source,patchId:'TDT-BUILD-EMIT-01',profile:'production',candidateState:'EMITTED_ARTIFACT_IDENTITY_VERIFIED',promotable:false,artifactVerificationMode:'emitted-artifact-sha256',sourceManifestSelfDigest:source.selfDigest,buildInputManifestDigest:input.selfDigest,emittedWorkerManifestDigest:worker.manifestDigest,viteEntryManifestDigest:vite.digest,legacyStaticAdmissionManifestDigest:admission.digest,staticRouteManifestDigest:route.digest,buildReproducibilityReceiptDigest:repro.selfDigest,rendererBuildId});
writeJson(path.join(dist,'dadum-runtime-manifest.json'),payload);
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_PRODUCTION_RUNTIME_MANIFEST.json'),payload);
console.log(`PASS BUILD-EMIT-01 production runtime ${rendererBuildId}`);
