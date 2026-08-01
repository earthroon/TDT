import fs from 'node:fs';
import path from 'node:path';
import { check, json, read, sourceArtifact, seal, sha256File } from './lib.mjs';
import { SPEC, SOURCE_STATE } from './identity.mjs';
const packageJson = json('package.json');
const requiredScripts = [
  'generate:resample-runtime-01-r12a','verify:resample-runtime-01-r12a','verify:resample-runtime-01-r12a:source',
  'gate:resample-runtime-01-r12a:source','finalize:resample-runtime-01-r12a:source',
  'run:resample-runtime-01-r12a:installed','verify:resample-runtime-01-r12a:installed','finalize:resample-runtime-01-r12a:installed',
  'verify:resample-runtime-01-r12a:predecessor'
];
for (const script of requiredScripts) check(typeof packageJson.scripts?.[script] === 'string', 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `package script missing: ${script}`);
const appFiles = fs.readdirSync('app/features/resample-runtime/r12a').filter((name) => name.endsWith('.mjs')).sort();
check(appFiles.length === 15, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', 'R12A app module count mismatch', appFiles);
const launcherFiles = fs.readdirSync('launcher/resample-runtime-r12a').filter((name) => name.endsWith('.mjs')).sort();
check(launcherFiles.length === 6, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', 'R12A launcher module count mismatch', launcherFiles);
const toolFiles = ['identity.mjs','lib.mjs','generate-source-artifacts.mjs','verify-parent-lineage.mjs','verify-authority-state-model.mjs','verify-transition-admission.mjs','verify-transaction-journal-lock.mjs','verify-session-drain.mjs','verify-activation-relaunch.mjs','verify-recovery-matrix.mjs','verify-electron-wiring.mjs','verify-renderer-wiring.mjs','verify-active-graph.mjs','verify-javascript-parse.mjs','verify-typescript-syntax.mjs','verify-negative-controls.mjs','verify-predecessor-regression.mjs','verify-source-contract.mjs','gate-source.mjs','finalize-source.mjs','run.mjs','run-installed.mjs','verify-installed.mjs','finalize-installed.mjs'];
for (const file of toolFiles) check(fs.existsSync(path.join('tools/resample-runtime-01-r12a', file)), 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `R12A tool missing: ${file}`);
const schemas = fs.readdirSync('tools/resample-runtime-01-r12a/schemas').filter((name) => name.endsWith('.schema.json')).sort();
check(schemas.length === 16, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', 'R12A schema count mismatch', schemas.length);
for (const file of schemas) { const schema = json(`tools/resample-runtime-01-r12a/schemas/${file}`); check(schema.$schema && schema.type === 'object' && Array.isArray(schema.required), 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `R12A schema invalid: ${file}`); }
const reports = ['R12A_PARENT_FREEZE_RECEIPT.json','R12A_AUTHORITY_AND_STATE_MODEL_RECEIPT.json','R12A_TRANSITION_ADMISSION_SELF_TEST.json','R12A_TRANSACTION_JOURNAL_LOCK_SELF_TEST.json','R12A_SESSION_DRAIN_SELF_TEST.json','R12A_ACTIVATION_RELAUNCH_SELF_TEST.json','R12A_RECOVERY_MATRIX_SELF_TEST.json','R12A_ELECTRON_WIRING_REPORT.json','R12A_RENDERER_WIRING_REPORT.json','R12A_ACTIVE_GRAPH_REPORT.json','R12A_JAVASCRIPT_PARSE_REPORT.json','R12A_TYPESCRIPT_SYNTAX_REPORT.json','R12A_NEGATIVE_CONTROL_REPORT.json','R12A_PREDECESSOR_REGRESSION_REPORT.json'];
for (const file of reports) check(json(`artifacts/resample-runtime-01-r12a/source-bake/${file}`).pass === true, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `source evidence failed: ${file}`);
const modulePlan = json('artifacts/runtime/generated-runtime-manifest.source.json');
const updateModule = modulePlan.modules.find((item) => item.id === 'dadum.module.atomic-update-r12a');
check(updateModule?.required === true && updateModule.ownsServices?.includes('dadum.runtime.update-coordinator-r12a'), 'E_R12A_TRANSACTION_INVALID', 'runtime manifest R12A module invalid');
const runtimeModules = read('app/src/boot/runtime-modules.ts');
check(runtimeModules.includes("id: 'dadum.module.preview-v1', version: '2.2.0'") && runtimeModules.includes("id: 'dadum.module.export-v1', version: '3.3.0'"), 'E_R12A_TRANSACTION_INVALID', 'runtime module versions differ from generated manifest');
check(!read('app/features/resample-runtime/r12a/main-update-coordinator.mjs').includes('request.runStagedCanary'), 'E_R12A_STAGED_CANARY_FAILED', 'renderer callback crosses IPC boundary');
const errorCorpus = [read(SPEC), ...appFiles.map((file) => read(`app/features/resample-runtime/r12a/${file}`)), ...launcherFiles.map((file) => read(`launcher/resample-runtime-r12a/${file}`))].join('\n');
const errorCodes = new Set([...errorCorpus.matchAll(/(E_R12A_[A-Z0-9_]+)/g)].map((match) => match[1]).filter((code) => code.length > 8));
check(errorCodes.size >= 35, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', 'stable R12A error registry too small', errorCodes.size);
check(SOURCE_STATE.includes('AWAITING_R11A_INSTALLED_AND_R10A_RELEASE'), 'E_R12A_FINAL_RECEIPT_INCOMPLETE', 'source state mismatch');
sourceArtifact('R12A_SOURCE_CONTRACT_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, requiredScriptCount: requiredScripts.length, appModuleCount: appFiles.length, launcherModuleCount: launcherFiles.length, toolFileCount: toolFiles.length, schemaCount: schemas.length, evidenceReportCount: reports.length, stableErrorCodeCount: errorCodes.size, specSha256: sha256File(SPEC), runtimeManifestSha256: sha256File('artifacts/runtime/generated-runtime-manifest.source.json'), activeGraphSha256: sha256File('app/src/runtime/active-graph/generated-active-runtime-graph.json'), dependencyLockConsistent: modulePlan.dependencyLock?.consistent === true, promotable: false, sourceModePointerMutation: false, installedExecutionClaimed: false }));
console.log('R12A source contract PASS');
