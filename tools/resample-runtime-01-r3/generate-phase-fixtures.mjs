import fs from 'node:fs';
import path from 'node:path';
import {
  COORDINATE_CONVENTION_ID,
  FIXTURE_MANIFEST_REL,
  FIXTURE_MANIFEST_SCHEMA_ID,
  FIXTURE_SCHEMA_ID,
  ROOT,
  canonicalJson,
  computeFixtureDigest,
  computeSourceDigest,
  sha256,
  writeCanonicalFile,
} from './lib.mjs';

const PHASES = [0, 1 / 16, 1 / 8, 3 / 16, 1 / 4, 5 / 16, 3 / 8, 7 / 16, 1 / 2, 9 / 16, 5 / 8, 11 / 16, 3 / 4, 13 / 16, 7 / 8, 15 / 16];
const PHASE_PAIRS = [[1/16,0],[1/4,0],[7/16,0],[0,1/16],[0,1/4],[0,7/16],[1/16,1/16],[1/4,1/4],[7/16,7/16],[1/8,3/8],[3/8,1/8],[1/4,3/4],[3/4,1/4]];
const RATIOS = [[9,8],[3,2],[13,8],[7,4],[2,1],[17,8],[31,16]];

function pixel(patternId, x, y, width, height) {
  const nx = width <= 1 ? 0 : x / (width - 1);
  const ny = height <= 1 ? 0 : y / (height - 1);
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const checker1 = (x + y) % 2;
  const checker2 = (Math.floor(x / 2) + Math.floor(y / 2)) % 2;
  switch (patternId) {
    case 'constant-rgba': return [0.2, 0.3, 0.4, 0.5];
    case 'horizontal-binary-step': return y >= centerY ? [0.8,0.6,0.4,1] : [0.05,0.04,0.03,1];
    case 'vertical-binary-step': return x >= centerX ? [0.8,0.6,0.4,1] : [0.05,0.04,0.03,1];
    case 'diagonal-binary-step': return x + y >= centerX + centerY ? [0.9,0.7,0.2,1] : [0.02,0.08,0.2,1];
    case 'single-impulse': return x === centerX && y === centerY ? [1,0.4,0.1,1] : [0,0,0,1];
    case 'two-adjacent-unequal-impulses': return x === centerX && y === centerY ? [1,0,0,1] : (x === Math.min(width-1, centerX+1) && y === centerY ? [0,0.7,0.1,1] : [0,0,0,1]);
    case 'linear-x-ramp': return [nx, 0.25 * nx, 0.1 + 0.5 * nx, 1];
    case 'linear-y-ramp': return [0.1 + 0.5 * ny, ny, 0.25 * ny, 1];
    case 'rgba-channel-separated-ramp': return [nx, ny, (nx + 2 * ny) / 3, 0.25 + 0.75 * ((nx + ny) / 2)];
    case 'checkerboard-1px': return checker1 ? [1,0.2,0.05,1] : [0.02,0.3,0.9,1];
    case 'checkerboard-2px': return checker2 ? [0.9,0.1,0.6,1] : [0.1,0.8,0.2,1];
    case 'horizontal-sinusoid': { const v = 0.5 + 0.5 * Math.sin(2 * Math.PI * nx * 3); return [v,0.2*v,1-v,1]; }
    case 'vertical-sinusoid': { const v = 0.5 + 0.5 * Math.sin(2 * Math.PI * ny * 3); return [0.2*v,v,1-v,1]; }
    case 'diagonal-stripe': { const v = ((x + 2*y) % 5) < 2 ? 0.9 : 0.1; return [v,1-v,0.3+0.4*v,1]; }
    case 'premultiplied-alpha-edge': { const a = x < centerX ? 0.15 : 0.9; return [0.8*a,0.35*a,0.1*a,a]; }
    case 'transparent-rgb-payload': return x === centerX && y === centerY ? [0.9,0.2,0.7,0] : [0,0,0,0];
    case 'border-impulse': return (x === 0 || y === 0 || x === width-1 || y === height-1) && ((x + y) % 3 === 0) ? [1,0.5,0.1,1] : [0,0,0,1];
    case 'asymmetric-four-corner': {
      if (x === 0 && y === 0) return [1,0,0,1];
      if (x === width-1 && y === 0) return [0,1,0,1];
      if (x === 0 && y === height-1) return [0,0,1,1];
      if (x === width-1 && y === height-1) return [1,1,0,1];
      return [0.05 + 0.2*nx,0.05 + 0.2*ny,0.1,1];
    }
    default: throw new Error(`unknown pattern ${patternId}`);
  }
}

function buildSource(sourceId, patternId, width, height) {
  const pixels = [];
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) pixels.push(...pixel(patternId, x, y, width, height));
  const source = { sourceId, patternId, width, height, pixels };
  source.sourceDigest = computeSourceDigest(source);
  return source;
}

const sources = [];
const sourceMap = new Map();
function addSource(sourceId, patternId, width = 17, height = 17) {
  if (sourceMap.has(sourceId)) return sourceMap.get(sourceId);
  const source = buildSource(sourceId, patternId, width, height);
  sources.push(source);
  sourceMap.set(sourceId, source);
  return source;
}

const basePatterns = [
  'constant-rgba','horizontal-binary-step','vertical-binary-step','diagonal-binary-step','single-impulse','two-adjacent-unequal-impulses','linear-x-ramp','linear-y-ramp','rgba-channel-separated-ramp','checkerboard-1px','checkerboard-2px','horizontal-sinusoid','vertical-sinusoid','diagonal-stripe','premultiplied-alpha-edge','transparent-rgb-payload','border-impulse','asymmetric-four-corner',
];
for (const patternId of basePatterns) addSource(`source-${patternId}`, patternId);

const ellipses = [
  { ellipseId:'isotropic-1', tangentX:1, tangentY:0, majorRadius:1, minorRadius:1, maxReach:2, kernelSharpness:1.65, taperExponent:1 },
  { ellipseId:'horizontal-3x1', tangentX:1, tangentY:0, majorRadius:3, minorRadius:1, maxReach:4, kernelSharpness:1.65, taperExponent:1 },
  { ellipseId:'vertical-3x1', tangentX:0, tangentY:1, majorRadius:3, minorRadius:1, maxReach:4, kernelSharpness:1.65, taperExponent:1 },
  { ellipseId:'diagonal-3x1', tangentX:1, tangentY:1, majorRadius:3, minorRadius:1, maxReach:4, kernelSharpness:1.65, taperExponent:1 },
  { ellipseId:'oblique-4x1.25', tangentX:2, tangentY:1, majorRadius:4, minorRadius:1.25, maxReach:5, kernelSharpness:1.65, taperExponent:1 },
  { ellipseId:'compact-r4-edge', tangentX:3, tangentY:2, majorRadius:4, minorRadius:0.82, maxReach:4, kernelSharpness:1.65, taperExponent:1 },
  { ellipseId:'full-r6-edge', tangentX:5, tangentY:2, majorRadius:6, minorRadius:0.82, maxReach:6, kernelSharpness:1.65, taperExponent:1 },
];
const ellipseMap = new Map(ellipses.map((entry) => [entry.ellipseId, entry]));
const fixtures = [];
function addFixture({ fixtureId, fixtureClass='direct-coordinate', sourceId, ellipseId, position=null, rasterMapping=null, semanticClasses=[] }) {
  const fixture = {
    fixtureSchemaId: FIXTURE_SCHEMA_ID,
    coordinateConventionId: COORDINATE_CONVENTION_ID,
    fixtureId,
    fixtureClass: fixtureClass === 'direct-coordinate' ? 'direct-coordinate' : 'raster-mapped',
    sourceId,
    ellipseId,
    position,
    rasterMapping,
    borderMode: 'clamp-extension',
    semanticClasses: [...new Set(semanticClasses)].sort(),
  };
  const source = sourceMap.get(sourceId);
  const ellipse = ellipseMap.get(ellipseId);
  if (!source || !ellipse) throw new Error(`fixture reference missing ${fixtureId}`);
  fixture.fixtureDigest = computeFixtureDigest(fixture, source, ellipse);
  fixtures.push(fixture);
}

PHASES.forEach((phase, index) => addFixture({
  fixtureId:`direct-x-phase-${String(index).padStart(2,'0')}`,
  sourceId:'source-rgba-channel-separated-ramp', ellipseId:'horizontal-3x1', position:[7+phase,8],
  semanticClasses:[phase === 0 ? 'integer-phase-invariant' : 'phase-sensitive','x-phase','anisotropic','direct-coordinate'],
}));
PHASES.forEach((phase, index) => addFixture({
  fixtureId:`direct-y-phase-${String(index).padStart(2,'0')}`,
  sourceId:'source-rgba-channel-separated-ramp', ellipseId:'vertical-3x1', position:[8,7+phase],
  semanticClasses:[phase === 0 ? 'integer-phase-invariant' : 'phase-sensitive','y-phase','anisotropic','direct-coordinate'],
}));
PHASE_PAIRS.forEach(([phaseX,phaseY], index) => addFixture({
  fixtureId:`direct-phase-pair-${String(index).padStart(2,'0')}`,
  sourceId:'source-diagonal-stripe', ellipseId:index % 2 ? 'diagonal-3x1' : 'oblique-4x1.25', position:[7+phaseX,7+phaseY],
  semanticClasses:['phase-sensitive','diagonal-phase','anisotropic','direct-coordinate'],
}));

for (const [sourceN, destinationN] of RATIOS) {
  const ratioText = `${sourceN}-${destinationN}`;
  const sx = addSource(`source-ratio-x-${ratioText}`, 'linear-x-ramp', sourceN, 9);
  addFixture({ fixtureId:`raster-x-ratio-${ratioText}`, fixtureClass:'raster-mapped', sourceId:sx.sourceId, ellipseId:'horizontal-3x1', rasterMapping:{sourceWidth:sourceN,sourceHeight:9,destinationWidth:destinationN,destinationHeight:9,destinationX:Math.floor((destinationN-1)/2),destinationY:4}, semanticClasses:['phase-sensitive','x-phase','raster-mapped',sourceN/destinationN===2?'exact-2to1-ratio':'non-integer-ratio','anisotropic'] });
  const sy = addSource(`source-ratio-y-${ratioText}`, 'linear-y-ramp', 9, sourceN);
  addFixture({ fixtureId:`raster-y-ratio-${ratioText}`, fixtureClass:'raster-mapped', sourceId:sy.sourceId, ellipseId:'vertical-3x1', rasterMapping:{sourceWidth:9,sourceHeight:sourceN,destinationWidth:9,destinationHeight:destinationN,destinationX:4,destinationY:Math.floor((destinationN-1)/2)}, semanticClasses:['phase-sensitive','y-phase','raster-mapped',sourceN/destinationN===2?'exact-2to1-ratio':'non-integer-ratio','anisotropic'] });
}
const xyCases = [[9,7,8,4],[13,9,8,8],[7,17,4,8],[31,13,16,8]];
xyCases.forEach(([sw,sh,dw,dh], index) => {
  const source = addSource(`source-ratio-xy-${index}`, 'rgba-channel-separated-ramp', sw, sh);
  addFixture({ fixtureId:`raster-xy-ratio-${index}`, fixtureClass:'raster-mapped', sourceId:source.sourceId, ellipseId:index%2?'oblique-4x1.25':'diagonal-3x1', rasterMapping:{sourceWidth:sw,sourceHeight:sh,destinationWidth:dw,destinationHeight:dh,destinationX:Math.floor(dw/2),destinationY:Math.floor(dh/2)}, semanticClasses:['phase-sensitive','diagonal-phase','raster-mapped','non-integer-ratio','anisotropic'] });
});

basePatterns.forEach((patternId, index) => addFixture({
  fixtureId:`pattern-coverage-${String(index).padStart(2,'0')}`,
  sourceId:`source-${patternId}`, ellipseId:index % 3 === 0 ? 'isotropic-1' : (index % 3 === 1 ? 'diagonal-3x1' : 'oblique-4x1.25'), position:[7.25,8.375],
  semanticClasses:['source-pattern-coverage','phase-sensitive',patternId === 'premultiplied-alpha-edge' ? 'alpha' : '',patternId === 'transparent-rgb-payload' ? 'hidden-rgb-diagnostic-only' : '',patternId.includes('border') ? 'border' : ''].filter(Boolean),
}));
ellipses.forEach((ellipse, index) => addFixture({
  fixtureId:`ellipse-coverage-${String(index).padStart(2,'0')}`,
  sourceId:'source-two-adjacent-unequal-impulses', ellipseId:ellipse.ellipseId, position:[8.25,8.375],
  semanticClasses:['ellipse-coverage','phase-sensitive',ellipse.majorRadius===ellipse.minorRadius?'isotropic':'anisotropic'],
}));

const borderCases = [
  ['top-left',0.125,0.25],['top-right',15.875,0.25],['bottom-left',0.125,15.75],['bottom-right',15.875,15.75],
];
borderCases.forEach(([name,x,y]) => addFixture({fixtureId:`border-${name}`,sourceId:'source-asymmetric-four-corner',ellipseId:'oblique-4x1.25',position:[x,y],semanticClasses:['phase-sensitive','border','anisotropic']}));
const oneWide = addSource('source-one-pixel-wide','linear-y-ramp',1,17);
addFixture({fixtureId:'border-one-pixel-wide',sourceId:oneWide.sourceId,ellipseId:'horizontal-3x1',position:[-0.25,8.375],semanticClasses:['phase-sensitive','border','x-phase','anisotropic']});
const oneHigh = addSource('source-one-pixel-high','linear-x-ramp',17,1);
addFixture({fixtureId:'border-one-pixel-high',sourceId:oneHigh.sourceId,ellipseId:'vertical-3x1',position:[8.375,-0.25],semanticClasses:['phase-sensitive','border','y-phase','anisotropic']});
const twoByTwo = addSource('source-two-by-two','asymmetric-four-corner',2,2);
addFixture({fixtureId:'border-two-by-two-anisotropic',sourceId:twoByTwo.sourceId,ellipseId:'diagonal-3x1',position:[0.25,0.75],semanticClasses:['phase-sensitive','border','diagonal-phase','anisotropic']});
addFixture({fixtureId:'border-alpha-edge',sourceId:'source-premultiplied-alpha-edge',ellipseId:'oblique-4x1.25',position:[0.25,8.25],semanticClasses:['phase-sensitive','border','alpha','anisotropic']});

for (const [index, position] of [[0,[7.125,8]],[1,[7.375,8]],[2,[7.625,8]],[3,[7.875,8]],[4,[0.25,8]],[5,[15.75,8]]]) {
  addFixture({fixtureId:`alpha-phase-${index}`,sourceId:'source-premultiplied-alpha-edge',ellipseId:index<4?'horizontal-3x1':'oblique-4x1.25',position,semanticClasses:['phase-sensitive','alpha',index>=4?'border':'x-phase','anisotropic']});
}

const manifest = {
  schemaVersion: 1,
  schemaId: FIXTURE_MANIFEST_SCHEMA_ID,
  fixtureSchemaId: FIXTURE_SCHEMA_ID,
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R3',
  coordinateConventionId: COORDINATE_CONVENTION_ID,
  generatorId: 'tdt.ewa.fixture-generator.deterministic.v1',
  canonicalIdentityExcludesWallClock: true,
  phaseSet: PHASES,
  phasePairs: PHASE_PAIRS,
  rasterRatios: RATIOS.map(([source,destination])=>({source,destination,ratio:source/destination})),
  requiredPatternIds: basePatterns,
  requiredEllipseIds: ellipses.map((entry)=>entry.ellipseId),
  sources: sources.sort((a,b)=>a.sourceId.localeCompare(b.sourceId)),
  ellipses,
  fixtures: fixtures.sort((a,b)=>a.fixtureId.localeCompare(b.fixtureId)),
};
manifest.coverage = {
  fixtureCount: manifest.fixtures.length,
  sourceCount: manifest.sources.length,
  ellipseCount: manifest.ellipses.length,
  semanticClassCounts: Object.fromEntries([...new Set(manifest.fixtures.flatMap((entry)=>entry.semanticClasses))].sort().map((key)=>[key,manifest.fixtures.filter((entry)=>entry.semanticClasses.includes(key)).length])),
};
manifest.manifestDigest = sha256(canonicalJson({...manifest,manifestDigest:undefined}));
const output = process.env.R3_FIXTURE_OUTPUT ? path.resolve(process.env.R3_FIXTURE_OUTPUT) : path.join(ROOT, FIXTURE_MANIFEST_REL);
const sourceDigestOutput = process.env.R3_SOURCE_DIGEST_OUTPUT ? path.resolve(process.env.R3_SOURCE_DIGEST_OUTPUT) : path.join(ROOT,'fixtures/resample-runtime-01-r3/sources/SOURCE_PAYLOAD_DIGESTS.json');
writeCanonicalFile(output, manifest);
writeCanonicalFile(sourceDigestOutput, {
  schemaVersion:1,
  patchId:'TDT-RESAMPLE-RUNTIME-01-R3',
  sources:manifest.sources.map(({sourceId,patternId,width,height,sourceDigest})=>({sourceId,patternId,width,height,sourceDigest})),
});
console.log(`PASS R3 deterministic fixture generation fixtures=${manifest.fixtures.length} sources=${manifest.sources.length} digest=${manifest.manifestDigest}`);
