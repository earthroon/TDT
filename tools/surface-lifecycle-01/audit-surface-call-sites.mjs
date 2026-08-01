import { listFiles, read, writeJson } from './lib.mjs';
const files = [...listFiles('app/src'), ...listFiles('app/legacy-runtime')];
const patterns = {
  createTexture: /\.createTexture\s*\(/g,
  destroy: /\.destroy\s*\(/g,
  createImageBitmap: /\bcreateImageBitmap\s*\(/g,
  readPixels: /\.readPixels\s*\(/g,
  mapAsync: /\.mapAsync\s*\(/g,
  filteredSurface: /__DADUM_FILTERED_SURFACE__/g,
  filteredRgba8: /__DADUM_FILTERED_RGBA8__/g,
};
const counts = {};
for (const [name, pattern] of Object.entries(patterns)) counts[name] = { calls: 0, files: 0 };
for (const file of files) {
  const source = read(file);
  for (const [name, pattern] of Object.entries(patterns)) {
    const matches = source.match(pattern)?.length ?? 0;
    counts[name].calls += matches;
    if (matches) counts[name].files += 1;
  }
}
const assignments = files.flatMap((file) => read(file).split(/\r?\n/).map((line, index) => ({ file, line: index + 1, source: line.trim() })).filter((item) => /__DADUM_FILTERED_RGBA8__\s*=/.test(item.source)));
writeJson('surface-call-site-audit.json', { schemaVersion: 1, filesScanned: files.length, counts, filteredRgba8Assignments: assignments, pass: assignments.length === 0 });
if (assignments.length) { console.error(JSON.stringify(assignments, null, 2)); process.exit(1); }
console.log(`PASS surface call-site audit files=${files.length} filteredRgba8Assignments=0`);
