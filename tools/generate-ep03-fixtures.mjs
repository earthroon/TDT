import fs from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256Bytes, sha256File, writeJson } from './ep03-promotion-lib.mjs';

const root = path.resolve('fixtures/promotion/ep03');
fs.mkdirSync(root, { recursive: true });

function rgba8(width, height, fn) {
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const px = fn(x, y);
    out[i] = px[0]; out[i + 1] = px[1]; out[i + 2] = px[2]; out[i + 3] = px[3];
  }
  return out;
}

function rgba16le(width, height, fn) {
  const out = Buffer.alloc(width * height * 8);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 8;
    const px = fn(x, y);
    for (let c = 0; c < 4; c++) out.writeUInt16LE(px[c], i + c * 2);
  }
  return out;
}

const fixtures = [
  { id: 'rgba8-opaque-grid-v1', width: 8, height: 8, storage: 'rgba8unorm', bytes: rgba8(8, 8, (x, y) => [(x * 37 + y * 11) & 255, (x * 13 + y * 29) & 255, (x * 7 + y * 43) & 255, 255]), purposes: ['png8', 'webp', 'jpeg', 'jxl', 'psd-rgb8'] },
  { id: 'rgba8-hidden-rgb-v1', width: 8, height: 8, storage: 'rgba8unorm', bytes: rgba8(8, 8, (x, y) => [17 + x * 19, 23 + y * 17, (x * 31 + y * 5) & 255, (x + y) % 3 === 0 ? 0 : 255]), purposes: ['png8', 'webp', 'jxl', 'psd-rgb8', 'hidden-rgb'] },
  { id: 'rgba8-alpha-matte-v1', width: 8, height: 8, storage: 'rgba8unorm', bytes: rgba8(8, 8, (x, y) => [220, 40 + x * 12, 30 + y * 16, Math.round(((x + y) / 14) * 255)]), purposes: ['jpeg-matte', 'psd-alpha'] },
  { id: 'rgba16le-gradient-v1', width: 8, height: 8, storage: 'rgba16le', bytes: rgba16le(8, 8, (x, y) => [x * 9362, y * 9362, ((x + y) * 4681) & 65535, (x + y) % 4 === 0 ? 0 : 65535]), purposes: ['png16', 'psd-rgb16'] },
];

const records = [];
for (const fixture of fixtures) {
  const filename = `${fixture.id}.${fixture.storage}.bin`;
  const file = path.join(root, filename);
  fs.writeFileSync(file, fixture.bytes);
  records.push({
    fixtureId: fixture.id,
    width: fixture.width,
    height: fixture.height,
    storage: fixture.storage,
    byteLength: fixture.bytes.length,
    sha256: sha256File(file),
    relativePath: `fixtures/promotion/ep03/${filename}`,
    purposes: fixture.purposes,
  });
}
const manifest = {
  schemaVersion: 1,
  fixtureManifestId: 'dadum.export.ep03-fixture-corpus-v1',
  records,
  requiredColorProfiles: [
    { profileId: 'ep03-source-srgb-v1', role: 'source-rgb', present: false, sha256: null },
    { profileId: 'ep03-destination-cmyk-a-v1', role: 'destination-cmyk', present: false, sha256: null },
    { profileId: 'ep03-destination-cmyk-b-v1', role: 'destination-cmyk', present: false, sha256: null },
  ],
};
manifest.corpusDigest = sha256Bytes(canonicalJson(manifest));
writeJson(path.join(root, 'fixture-manifest.json'), manifest);
console.log(`EP03_FIXTURE_CORPUS_DIGEST=${manifest.corpusDigest}`);
