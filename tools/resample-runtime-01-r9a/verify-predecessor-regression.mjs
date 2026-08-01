import {spawnSync} from 'node:child_process';
import {check,sourceArtifact,seal,read} from './lib.mjs';
const scripts=[
  'tools/resample-runtime-01-r8/verify-support.mjs',
  'tools/resample-runtime-01-r8/verify-semantics.mjs',
  'tools/resample-runtime-01-r8/verify-conservation.mjs',
  'tools/resample-runtime-01-r8/verify-generated-sources.mjs',
  'tools/resample-runtime-01-r8/verify-negative-controls.mjs',
  'tools/resample-runtime-01-r8a/verify-parse-closure.mjs',
  'tools/resample-runtime-01-r8a/verify-runtime-self-tests.mjs',
  'tools/resample-runtime-01-r8a/verify-zero-silent-fallback.mjs',
];
const results=[];
for(const script of scripts){
  const result=spawnSync(process.execPath,[script],{cwd:process.cwd(),encoding:'utf8'});
  check(result.status===0,'E_R9A_PREDECESSOR_REGRESSION',`Predecessor verification failed: ${script}`,{stdout:result.stdout,stderr:result.stderr,status:result.status});
  results.push({script,exitCode:result.status,tail:result.stdout.trim().split('\n').slice(-4)});
}
const preview=read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const exp=read('app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');
check(preview.includes('executeCanonicalEwaLowpassR9A')&&exp.includes('executeCanonicalEwaLowpassR9A'),'E_R9A_REBASE_WIRING','R9A wiring did not supersede R8 runtime wiring');
sourceArtifact('R9A_PREDECESSOR_REGRESSION_REPORT.json',seal({schemaVersion:1,pass:true,behavioralChecks:results,r8RuntimeWiringSupersededByR9A:true,r8MathAndGeneratedShaderBehaviorPreserved:true}));
console.log('PASS R9A R8/R8A behavioral regression with R9A wiring supersession 1/1');
