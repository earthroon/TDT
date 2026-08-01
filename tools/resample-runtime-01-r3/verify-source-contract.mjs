import fs from 'node:fs';
import path from 'node:path';
import {
  COORDINATE_CONVENTION_ID,
  FIXTURE_MANIFEST_REL,
  NEGATIVE_CONTROL_ID,
  ORACLE_ID,
  PARENT_FILES,
  PARENT_ZIP_SHA256,
  REQUIRED_ERROR_CODES,
  ROOT,
  check,
  loadFixtureManifest,
  read,
  sha256File,
  writeJson,
} from './lib.mjs';

const checks=[];
for(const [name,[relative,expected]] of Object.entries(PARENT_FILES))checks.push(check(sha256File(relative)===expected,`PARENT-${name}`,`${name} immutable parent digest`,{relative,expected,actual:sha256File(relative)}));
const packageJson=JSON.parse(read('package.json'));
const requiredScripts={
  'generate:resample-runtime-01-r3':'node tools/resample-runtime-01-r3/generate-phase-fixtures.mjs',
  'verify:resample-runtime-01-r3:oracle':'node tools/resample-runtime-01-r3/verify-oracle-self-tests.mjs && node tools/resample-runtime-01-r3/verify-fractional-phase.mjs',
  'verify:resample-runtime-01-r3:source':'node tools/resample-runtime-01-r3/verify-source-contract.mjs && node tools/resample-runtime-01-r3/verify-shared-error-source.mjs && node tools/resample-runtime-01-r3/verify-zero-runtime-cpu-fallback.mjs',
  'smoke:resample-runtime-01-r3':'node tools/resample-runtime-01-r3/runtime-smoke.mjs',
  'gate:resample-runtime-01-r3':'node tools/resample-runtime-01-r3/gate.mjs',
  'verify:resample-runtime-01-r3':'node tools/resample-runtime-01-r3/run.mjs',
  'finalize:resample-runtime-01-r3':'node tools/resample-runtime-01-r3/finalize.mjs',
};
checks.push(check(Object.entries(requiredScripts).every(([key,value])=>packageJson.scripts?.[key]===value),'SOURCE-01','required package scripts exact'));
const stable=read('app/src/boot/stable-error.ts');
checks.push(check(REQUIRED_ERROR_CODES.every((code)=>stable.includes(`'${code}'`)),'SOURCE-02','stable error registry contains all R3 codes'));
const manifest=loadFixtureManifest();
checks.push(check(manifest.coordinateConventionId===COORDINATE_CONVENTION_ID&&manifest.fixtureSchemaId==='tdt.ewa.fractional-phase-fixtures.v1','SOURCE-03','fixture identity exact'));
checks.push(check(manifest.phaseSet.length===16&&manifest.phasePairs.length===13&&manifest.rasterRatios.length===7,'SOURCE-04','mandatory phase and ratio sets complete',manifest.coverage));
checks.push(check(manifest.requiredPatternIds.length===18&&manifest.requiredEllipseIds.length===7,'SOURCE-05','mandatory source and ellipse classes complete'));
const requiredSemantics=['x-phase','y-phase','diagonal-phase','anisotropic','border','alpha','non-integer-ratio','exact-2to1-ratio'];
checks.push(check(requiredSemantics.every((key)=>(manifest.coverage.semanticClassCounts[key]??0)>0),'SOURCE-06','mandatory semantic coverage complete',manifest.coverage.semanticClassCounts));
const generator=read('tools/resample-runtime-01-r3/generate-phase-fixtures.mjs');
checks.push(check(!generator.includes('Math.random')&&!generator.includes('Date.now')&&!generator.includes('new Date')&&!generator.includes('process.pid')&&!generator.includes('hostname'),'SOURCE-07','fixture generator has no randomness or wall-clock identity'));
const oracle=read('tools/resample-runtime-01-r3/ewa-f64-oracle.mjs');
checks.push(check(!oracle.includes('Math.fround')&&!oracle.includes('Float32Array'),'SOURCE-08','oracle primary arithmetic remains binary64'));
checks.push(check(oracle.includes('(destinationCoordinate + 0.5) * srcPerDst - 0.5')&&oracle.includes('Math.floor(position[0])')&&oracle.includes('logicalSampleCoordinate[0] - position[0]'),'SOURCE-09','continuous coordinate contract encoded'));
checks.push(check(oracle.includes('NeumaierSum')&&oracle.includes('const weightSum = new NeumaierSum()'),'SOURCE-10','compensated accumulation encoded'));
const negative=read('tools/resample-runtime-01-r3/round-centered-negative-control.mjs');
checks.push(check(negative.includes('Math.sign(value) * Math.floor(Math.abs(value) + 0.5)')&&negative.includes('negativeDistance(offsetX, offsetY)'),'SOURCE-11','negative control identity encoded'));
checks.push(check(!oracle.includes("from './round-centered-negative-control.mjs'")&&!negative.includes("from './ewa-f64-oracle.mjs'"),'SOURCE-12','oracle and negative coordinate implementations are separate'));
const importSources=['ewa-f64-oracle.mjs','ewa-f64-oracle-matrix-check.mjs','round-centered-negative-control.mjs','r2-shared-error-model.mjs'].map((name)=>read(`tools/resample-runtime-01-r3/${name}`)).join('\n');
checks.push(check(!/from\s+['"](?:\.\.\/)*app\//.test(importSources)&&!importSources.includes('resample-runtime-01-r2')&&!importSources.includes('resample-runtime-01-r1'),'SOURCE-13','oracle imports no product runtime math'));
checks.push(check(fs.existsSync(path.join(ROOT,'specs/TDT-RESAMPLE-RUNTIME-01-R3_INDEPENDENT_FRACTIONAL_PHASE_EWA_ORACLE_CONTINUOUS_SOURCE_LATTICE_COORDINATE_TRUTH_SHARED_PRODUCT_REFERENCE_ERROR_DETECTION_ROUND_CENTERED_NEGATIVE_CONTROL_ZERO_RUNTIME_CPU_FALLBACK_SEAL_SPEC.md')),'SOURCE-14','R3 specification present'));
const readme=read('README_TDT_RESAMPLE_RUNTIME_01_R3_APPLIED.md');
checks.push(check(readme.includes('R3 did not repair or promote the current product.')&&readme.includes('R4 is required for product repair.'),'SOURCE-15','applied README states reject without repair'));
const assetManifest=read('app/src/runtime/assets/generated-runtime-asset-manifest.json');
const activeGraph=read('app/src/runtime/active-graph/generated-active-runtime-graph.json');
checks.push(check(!assetManifest.includes('resample-runtime-01-r3')&&!activeGraph.includes('resample-runtime-01-r3'),'SOURCE-16','R3 validation code absent from runtime authorities'));
const pointer='artifacts/active-graph-01/source-bake/production-pointer-conservation.json';
checks.push(check(sha256File(pointer)==='1ba18f9430d639bc4314e3cf6e0fa96aa3d7fa390c0648000d22b223065af2ef','SOURCE-17','Production Pointer conservation evidence unchanged'));
checks.push(check(PARENT_ZIP_SHA256==='5f352059892cf3e061ebbcd1a4ee4b10634565351492d02d384a82f53c64199b','SOURCE-18','parent bundle identity exact'));
checks.push(check(ORACLE_ID==='tdt.ewa.oracle.f64.fractional-phase.v1'&&NEGATIVE_CONTROL_ID==='tdt.ewa.negative-control.round-centered-r2.v1','SOURCE-19','oracle and negative identities exact'));
const pass=checks.every((entry)=>entry.pass);
const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',pass,parentZipSha256:PARENT_ZIP_SHA256,parentFiles:Object.fromEntries(Object.entries(PARENT_FILES).map(([key,[relative,expected]])=>[key,{relative,expected,actual:sha256File(relative)}])),fixtureManifestRelative:FIXTURE_MANIFEST_REL,fixtureManifestDigest:manifest.manifestDigest,checks};
writeJson('r3-source-contract.json',report);
if(!pass){console.error(checks.filter((entry)=>!entry.pass));process.exit(1);}console.log(`PASS R3 source contract ${checks.length}/${checks.length}`);
