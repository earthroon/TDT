import { canonicalJson, loadFixtureManifest, sha256 } from './lib.mjs';
import { evaluateOracleFixture } from './ewa-f64-oracle.mjs';
import { evaluateNegativeControlFixture } from './round-centered-negative-control.mjs';
const manifest=loadFixtureManifest();
const ids=['alpha-phase-0','border-bottom-left','direct-phase-pair-07','raster-x-ratio-2-1','ellipse-coverage-06'];
const records=ids.map((fixtureId)=>{const oracle=evaluateOracleFixture(fixtureId,manifest);const negative=evaluateNegativeControlFixture(fixtureId,manifest);return {fixtureId,oracleRgba:oracle.rgba,oracleWeightSum:oracle.weightSum,negativeRgba:negative.rgba,negativeWeightSum:negative.weightSum};});
const payload={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',fixtureManifestDigest:manifest.manifestDigest,records};
process.stdout.write(canonicalJson({payload,digest:sha256(canonicalJson(payload))}));
