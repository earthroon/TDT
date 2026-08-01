import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, canonicalJson, compareContentManifests, contentManifest, readJson, seal, sha256Bytes, writeJson } from './build-emit-01-lib.mjs';
const aRoot = process.argv[2] || process.env.DADUM_BUILD_EMIT_A;
const bRoot = process.argv[3] || process.env.DADUM_BUILD_EMIT_B;
if (!aRoot || !bRoot || !fs.existsSync(aRoot) || !fs.existsSync(bRoot)) throw new Error('E_BUILD_A_B_FILESET_MISMATCH');
const a = contentManifest(path.resolve(aRoot));
const b = contentManifest(path.resolve(bRoot));
const compare = compareContentManifests(a,b);
const manifestNames = ['dadum-vite-entry-manifest.json','dadum-runtime-worker-manifest.json','dadum-runtime-manifest.json','dadum-static-route-manifest.json'];
const manifestParity = manifestNames.map((name)=>{
  const af=path.join(aRoot,name), bf=path.join(bRoot,name);
  return {name,ok:fs.existsSync(af)&&fs.existsSync(bf)&&sha256Bytes(fs.readFileSync(af))===sha256Bytes(fs.readFileSync(bf))};
});
const receipt = seal({schemaVersion:1,patchId:'TDT-BUILD-EMIT-01',status:compare.equal&&manifestParity.every(x=>x.ok)?'BUILD_REPRODUCIBILITY_VERIFIED':'BLOCKED',buildAContentDigest:a.digest,buildBContentDigest:b.digest,differences:compare.differences,manifestParity});
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_BUILD_REPRODUCIBILITY_RECEIPT.json'),receipt);
if (receipt.status!=='BUILD_REPRODUCIBILITY_VERIFIED') throw new Error(compare.differences.length?'E_BUILD_A_B_BYTE_MISMATCH':'E_BUILD_A_B_MANIFEST_MISMATCH');
console.log(`PASS BUILD-EMIT-01 reproducibility ${a.records.length}`);
