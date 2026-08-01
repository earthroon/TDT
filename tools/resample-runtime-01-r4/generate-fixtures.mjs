import fs from 'node:fs'; import path from 'node:path';
import { ROOT, FIXTURE_REL, canonicalJson, sha256 } from './lib.mjs';
import { selectEwaR4Profile } from './phase-aware-tile-proof.mjs';
const cases = [
  ['odd-r4', 17, 13, 9, 7, 1, 1.25, 0.65], ['partial-r4', 31, 23, 17, 13, 1, 1.25, 0.65], ['one-x-r4', 2, 19, 1, 11, 1, 1.25, 0.65], ['one-y-r4', 19, 2, 11, 1, 1, 1.25, 0.65], ['noninteger-r4', 127, 83, 73, 49, 1, 1.25, 0.65], ['exact-2to1-r4', 2048, 1024, 1024, 512, 1, 1.25, 0.65], ['anisotropic-xy-r4', 192, 81, 128, 53, 1, 1.25, 0.65],
  ['odd-r6', 17, 13, 9, 7, 4, 1.25, 0.65], ['partial-r6', 31, 23, 17, 13, 4, 1.25, 0.65], ['one-axis-r6', 2, 15, 1, 8, 4, 1.25, 0.65], ['noninteger-r6', 127, 83, 73, 49, 4, 1.25, 0.65], ['exact-2to1-r6', 2048, 1024, 1024, 512, 4, 1.25, 0.65], ['anisotropic-xy-r6', 192, 81, 128, 53, 4, 1.25, 0.65],
];
const fixtures = cases.map(([fixtureId, inW, inH, outW, outH, maxAnisotropy, sigmaMain, sigmaCross]) => { const request = { inW, inH, outW, outH, maxAnisotropy, sigmaMain, sigmaCross, maxSampleReach: 6, minorCoverageFactor: 0.82 }; const selection = selectEwaR4Profile(request, { maxComputeWorkgroupStorageSize: 32768 }); return { fixtureId, request, expectedProfileKey: selection.profile.key, expectedProfileId: selection.profile.profileId, expectedRequiredReach: selection.proof.requiredReach, expectedTileProof: selection.tileProof }; });
const payload = { schemaVersion: 1, schemaId: 'tdt.ewa.r4.tile-proof-fixtures.v1', coordinateConventionId: 'tdt.ewa.source-lattice.pixel-center-v2', fixtureCount: fixtures.length, fixtures };
payload.manifestDigest = sha256(canonicalJson(payload)); const target = path.join(ROOT, FIXTURE_REL); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, canonicalJson(payload)); console.log(`generated ${fixtures.length} R4 tile fixtures ${payload.manifestDigest}`);
