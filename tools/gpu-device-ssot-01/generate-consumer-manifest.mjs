import { read, sha256, writeJson } from './lib.mjs';
const manifest=JSON.parse(read('app/src/runtime/gpu/gpu-consumer-manifest.json'));
const profile=JSON.parse(read('app/src/runtime/gpu/gpu-authority-profile.json'));
writeJson('gpu-consumer-manifest-receipt.json',{schemaVersion:1,consumerCount:manifest.consumers.length,consumerManifestSha256:sha256(JSON.stringify(manifest)),authorityProfileSha256:sha256(JSON.stringify(profile)),ownerIds:manifest.consumers.map((x)=>x.ownerId).sort()});
console.log(`PASS generated GPU consumer manifest receipt consumers=${manifest.consumers.length}`);
