import fs from 'node:fs';
import path from 'node:path';
import { blockedReport, sha256File, writeJson } from './ep03-promotion-lib.mjs';

const artifactDir = path.resolve('artifacts/promotion');
const registry = fs.readFileSync('app/src/runtime/decode/independent-decoder-profile.ts', 'utf8');
const records = [
  {
    decoderId: 'dadum.decoder.native-raster-v1',
    formats: ['png', 'jpeg', 'webp'],
    sourceArtifacts: ['native/decoder-rs/src/lib.rs'],
    packagedArtifactRequired: 'resources/app.asar.unpacked/native/decoder-rs/decoder_rs.win32-x64-msvc.node',
  },
  {
    decoderId: 'dadum.decoder.jxl-independent-v1',
    formats: ['jxl'],
    sourceArtifacts: ['app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_decode.js', 'app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_wgpu_bridge_bg.wasm'],
    encoderArtifact: 'app/legacy-runtime/encoders/jxl_bindings.wasm',
  },
  {
    decoderId: 'dadum.decoder.psd-independent-v1',
    formats: ['psd'],
    sourceArtifacts: ['app/legacy-runtime/decoders/psd_decode_worker.js', 'app/legacy-runtime/vendor/psd/psd_core.wasm'],
    encoderArtifact: 'app/legacy-runtime/libs/psd/pkg/psd_exporter_wasm_bg.wasm',
  },
].map((record) => {
  const artifacts = record.sourceArtifacts.map((file) => ({ file, present: fs.existsSync(file), sha256: fs.existsSync(file) ? sha256File(file) : null }));
  const encoderSha256 = record.encoderArtifact && fs.existsSync(record.encoderArtifact) ? sha256File(record.encoderArtifact) : null;
  const decoderWasm = artifacts.find((entry) => entry.file.endsWith('.wasm'));
  return {
    ...record,
    sourceRegistered: registry.includes(record.decoderId),
    artifacts,
    encoderSha256,
    decoderArtifactDistinctFromEncoder: decoderWasm?.sha256 && encoderSha256 ? decoderWasm.sha256 !== encoderSha256 : record.decoderId === 'dadum.decoder.native-raster-v1',
  };
});
const nativeAddonPath='native/decoder-rs/decoder_rs.win32-x64-msvc.node';
const nativeNodePresent=fs.existsSync(nativeAddonPath);
const nativeNodeSha256=nativeNodePresent?sha256File(nativeAddonPath):null;
const blockers = [];
for (const record of records) {
  if (!record.sourceRegistered || record.artifacts.some((entry) => !entry.present) || record.decoderArtifactDistinctFromEncoder !== true) blockers.push(`decoder-source-incomplete:${record.decoderId}`);
}
if (!nativeNodePresent) blockers.push('native-raster-decoder-addon-missing');
blockers.push('packaged-independent-decoder-execution-not-run');
const report = blockedReport('TDT_EXPORT_PROMOTION_03_DECODER_MATRIX_REPORT', blockers, {
  decoderMatrixId: 'dadum.export.ep03-independent-decoder-matrix-v1',
  records,
  nativeNodePresent,
  nativeAddonPath,
  nativeNodeSha256,
  nativeAttestationRequired:true,
  packagedExecutionVerified: false,
});
writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_DECODER_MATRIX_REPORT.json'), report);
writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_DECODER_INDEPENDENCE_REPORT.json'), { ...report, reportId: 'TDT_EXPORT_PROMOTION_03_DECODER_INDEPENDENCE_REPORT' });
console.log(`${report.status} independent decoder matrix; blockers=${report.blockers.length}`);
