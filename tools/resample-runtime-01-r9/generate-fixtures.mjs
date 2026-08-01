import { writeFixture, stableJson, sha256Buffer, ensureDir, FIXTURE_DIR } from './lib.mjs';
import { R9_COORDINATE_ID, R9_AXIAL_FIELD_ID } from './identity.mjs';
const baseFixtures=[
  ['impulse','impulse'],['checker','checker'],['line-h','line'],['line-v','line'],['line-d22','line'],['line-d45','line'],['line-d67','line'],
  ['constant','constant'],['alpha-edge','alpha-edge'],['transparent-rgb','transparent-rgb'],['border-corner','border-corner'],['partial-group','partial-group']
];
const fixtures=[];
for(const profile of ['R4','R6'])for(const [name,kind] of baseFixtures){const angle=name==='line-v'?90:name==='line-d22'?22.5:name==='line-d45'?45:name==='line-d67'?67.5:0;fixtures.push({fixtureId:`${profile.toLowerCase()}-${name}`,profile,kind,angleDegrees:angle,width:profile==='R4'?17:23,height:profile==='R4'?13:19,outWidth:profile==='R4'?13:11,outHeight:profile==='R4'?9:9,params:{sigmaMain:profile==='R4'?1.2:1.65,sigmaCross:0.65,maxAnisotropy:profile==='R4'?2:3,maxSampleReach:profile==='R4'?4:6,edgeLow:0.025,edgeHigh:0.22,minorCoverageFactor:0.82,coherenceExponent:1.25,kernelSharpness:1.65,kernelTaperExponent:1,phaseConvention:2,borderMode:1,flags:0}});}
const manifestBase={schemaVersion:1,schemaId:'tdt.ewa.r9.fixture-manifest.v1',coordinateConventionId:R9_COORDINATE_ID,axialFieldSchemaId:R9_AXIAL_FIELD_ID,seed:'tdt-r9-deterministic-zero-randomness',fixtures};
const fixtureDigest=sha256Buffer(stableJson(manifestBase));const manifest={...manifestBase,fixtureDigest};ensureDir(FIXTURE_DIR);writeFixture('R9_FIXTURE_MANIFEST.json',manifest);console.log(`R9 fixtures ${fixtures.length} digest ${fixtureDigest}`);
