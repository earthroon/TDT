import { generate, renderAll } from './generate-wgsl.mjs';
import { read, readJson, shaBytes, writeArtifact, check } from './lib.mjs';

const checks = [];
const c = (pass, name, detail = null) => checks.push(check(pass, name, detail));
const { outputs, manifest } = generate({ write: false });
const diskManifest = readJson('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r6.json');

c(outputs.length === 5, 'output-count');
c(manifest.manifestId === 'tdt.ewa.generated-shader-manifest.r6.v1', 'manifest-id');
c(JSON.stringify(manifest) === JSON.stringify(diskManifest), 'manifest-replay');

const markerNames = ['ABI', 'COORDINATE', 'AXIAL', 'BORDER', 'KERNEL'];
const fragmentMap = new Map();
for (const output of outputs) {
  const disk = read(output.path);
  c(disk === output.text, `replay:${output.path}`);
  c(disk.endsWith('\n') && !disk.endsWith('\n\n'), `newline:${output.path}`);
  c(disk.startsWith('// @generated=true'), `header:${output.path}`);
  c(!/20\d\d-|T\d\d:|\\\\/.test(disk.split('\n').slice(0, 12).join('\n')), `no-volatile:${output.path}`);
  const record = diskManifest.outputs.find((item) => item.path === output.path);
  c(record?.outputDigest === shaBytes(disk), `digest:${output.path}`);
  for (const name of markerNames) {
    const begin = `// <TDT:R6:${name}:BEGIN>`;
    const endMarker = `// <TDT:R6:${name}:END>`;
    const start = disk.indexOf(begin);
    const end = disk.indexOf(endMarker);
    c(start >= 0 && end > start, `marker:${name}:${output.path}`);
    const fragment = disk.slice(start, end + endMarker.length).replace(/\r\n/g, '\n') + '\n';
    const digest = shaBytes(fragment);
    if (!fragmentMap.has(name)) fragmentMap.set(name, digest);
    c(fragmentMap.get(name) === digest, `fragment:${name}:${output.path}`, digest);
  }
}

c(new Set(outputs.map((output) => shaBytes(output.text))).size === 5, 'full-digests-independent');
c(outputs.filter((output) => output.role === 'PRODUCT').every((output) => output.text.includes('var<workgroup> tile')), 'product-tiled');
const reference = outputs.find((output) => output.role === 'REFERENCE');
c(reference.text.includes('loadSourceClamped(logicalSampleCoord)'), 'reference-direct-load');
c(!reference.text.includes('var<workgroup> tile'), 'reference-no-tile');
c(outputs.every((output) => !output.text.includes('exp(-1.65') && !output.text.includes('pow(taperBase, 1.0)')), 'no-literal-kernel-defaults');

const mutated = outputs[0].text.replace('kernelWeight', 'kernelWeighx');
c(shaBytes(mutated) !== diskManifest.outputs[0].outputDigest, 'negative-output-mutation');
const changed = renderAll()[0].text.replace('const EPS', 'const EPS_MUTATED');
c(changed !== outputs[0].text, 'negative-template-stale');
c(shaBytes(JSON.stringify({ ...manifest, kernelContractDigest: '0'.repeat(64) })) !== shaBytes(JSON.stringify(manifest)), 'negative-contract-stale');
c(JSON.stringify({ ...manifest, outputs: [...manifest.outputs.slice(0, 1), { ...manifest.outputs[1], outputDigest: '0'.repeat(64) }, ...manifest.outputs.slice(2)] }) !== JSON.stringify(manifest), 'negative-manifest-mutation');
c(outputs.some((output) => output.profile === 'R4') && outputs.some((output) => output.profile === 'R6'), 'profile-pair');

const pass = checks.every((item) => item.pass);
writeArtifact('TDT_RESAMPLE_RUNTIME_01_R6_GENERATED_SOURCE_RECEIPT.json', {
  schemaVersion: 1,
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R6',
  pass,
  manifestDigest: shaBytes(JSON.stringify(diskManifest, null, 2) + '\n'),
  checks,
});
if (!pass) {
  console.error(checks.filter((item) => !item.pass));
  process.exit(1);
}
console.log(`PASS R6 generated sources ${checks.length}/${checks.length}`);
