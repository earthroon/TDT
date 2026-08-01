import fs from 'node:fs';
import path from 'node:path';
import { ABI_VERSION, ARTIFACT_DIR, CANONICAL_FILENAME, EXACT_SURFACES, PATCH_ID, ROOT, seal, sha256File, sourceAudit, syntheticAttestationFixture, writeJson } from './native-decoder-01-lib.mjs';
const audit=sourceAudit();const fixture=await syntheticAttestationFixture();
const blocked=['release-addon-missing','win32-x64-release-build-not-run','packaged-electron-execution-not-run','independent-pixel-roundtrip-not-run'];
const base={schemaVersion:1,patchId:PATCH_ID,status:'BLOCKED_RELEASE_ADDON_MISSING',evidenceState:'SOURCE_BAKED_UNPROMOTED',blockers:blocked};
const reports={
TDT_NATIVE_DECODER_01_SOURCE_INPUT_REPORT:{...base,sourcePresent:true,cargoLockPresent:fs.existsSync('native/decoder-rs/Cargo.lock'),nativePackageLockPresent:fs.existsSync('native/decoder-rs/package-lock.json')},
TDT_NATIVE_DECODER_01_TOOLCHAIN_REPORT:{...base,rootNapiCli:audit.rootNapiCli,nestedNapiCli:audit.nativeOwnCli,canonicalTarget:'x86_64-pc-windows-msvc',buildHost:`${process.platform}-${process.arch}`},
TDT_NATIVE_DECODER_01_ADDON_ARTIFACT_REPORT:{...base,canonicalFilename:CANONICAL_FILENAME,canonicalPresent:audit.canonicalPresent,releaseAddonCount:audit.releaseAddonCount,debugAddonCount:audit.debugAddonCount,artifactSha256:audit.canonicalSha256},
TDT_NATIVE_DECODER_01_ABI_REPORT:{...base,abiVersion:ABI_VERSION,requiredExports:['status','self_test','abi_descriptor','decode_buffer','decode_path'],rendererPathDecodeExposed:audit.pathDecodeRendererExposed},
TDT_NATIVE_DECODER_01_ATTESTATION_REPORT:{...base,protocol:'dadum-native-decoder-attestation-v1',sourceFixtureVerified:fixture.pass.attestationVerified,productionAttestationVerified:false},
TDT_NATIVE_DECODER_01_SELF_TEST_REPORT:{...base,sourceContractPresent:true,nativeSelfTestExecuted:false},
TDT_NATIVE_DECODER_01_EXACT_SURFACE_REPORT:{...base,exactSurfaces:EXACT_SURFACES,png16SourceExact:audit.exactU16Source,halfFloatConversionInNative:false},
TDT_NATIVE_DECODER_01_PNG8_REPORT:{...base,expectedSurface:'rgba8unorm-u8-v1',independentRoundtripVerified:false},
TDT_NATIVE_DECODER_01_PNG16_REPORT:{...base,expectedSurface:'rgba16le-unorm-u16-v1',independentRoundtripVerified:false},
TDT_NATIVE_DECODER_01_WEBP_REPORT:{...base,expectedSurface:'rgba8unorm-u8-v1',hiddenRgbVerified:false},
TDT_NATIVE_DECODER_01_JPEG_REPORT:{...base,expectedSurface:'rgba8unorm-u8-v1',lossyMetricVerified:false},
TDT_NATIVE_DECODER_01_METADATA_REPORT:{...base,metadataParsersPresent:audit.metadataSource,packagedMetadataVerified:false},
TDT_NATIVE_DECODER_01_ICC_REPORT:{...base,pngIccp:true,jpegApp2Icc:true,webpIccp:true,independentIccVerified:false},
TDT_NATIVE_DECODER_01_RESOLUTION_REPORT:{...base,pngPhys:true,jpegJfif:true,jpegExifResolution:true,independentResolutionVerified:false},
TDT_NATIVE_DECODER_01_LIMIT_REPORT:{...base,inputPixelMetadataLimitsPresent:audit.limitsSource,decompressionBombCorpusVerified:false},
TDT_NATIVE_DECODER_01_PACKAGING_REPORT:{...base,exactAddonAdmission:audit.packageExactAddon,packagedAddonCount:0,packagedExecutionVerified:false},
TDT_NATIVE_DECODER_01_INDEPENDENCE_REPORT:{...base,decoderId:'dadum.decoder.native-raster-v1',encoderArtifactSharing:false,browserFallbackUsed:false,registryAttestationGate:audit.registryAttestationGate},
TDT_NATIVE_DECODER_01_BUILD_REPRODUCIBILITY_REPORT:{...base,buildAExecuted:false,buildBExecuted:false,exactByteParityVerified:false},
TDT_NATIVE_DECODER_01_PROMOTION_RECEIPT:{...base,promoted:false,nativeDecoderPromoted:false,productionCapabilityAdvertised:false},
TDT_NATIVE_DECODER_01_FIX_RECEIPT:{...base,sourceBakeApplied:true,canonicalLoader:audit.canonicalLoader,sourceMutationScope:'native-decoder-authority-v1'}
};
for(const [name,value] of Object.entries(reports))writeJson(path.join(ARTIFACT_DIR,`${name}.json`),seal(value));
console.log(`WROTE ${Object.keys(reports).length} TDT-NATIVE-DECODER-01 reports`);
