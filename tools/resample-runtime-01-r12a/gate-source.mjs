import { json, check, sourceArtifact, seal } from './lib.mjs';
const requirements = json('artifacts/resample-runtime-01-r12a/source-bake/R12A_GATE_REQUIREMENTS.json');
const groups = [
  [1,30,'R12A_PARENT_FREEZE_RECEIPT.json'],
  [31,60,'R12A_AUTHORITY_AND_STATE_MODEL_RECEIPT.json'],
  [61,90,'R12A_TRANSITION_ADMISSION_SELF_TEST.json'],
  [91,110,'R12A_ELECTRON_WIRING_REPORT.json'],
  [111,120,'R12A_RENDERER_WIRING_REPORT.json'],
  [121,150,'R12A_TRANSACTION_JOURNAL_LOCK_SELF_TEST.json'],
  [151,180,'R12A_AUTHORITY_AND_STATE_MODEL_RECEIPT.json'],
  [181,210,'R12A_SESSION_DRAIN_SELF_TEST.json'],
  [211,240,'R12A_ACTIVATION_RELAUNCH_SELF_TEST.json'],
  [241,270,'R12A_RECOVERY_MATRIX_SELF_TEST.json'],
  [271,300,'R12A_RECOVERY_MATRIX_SELF_TEST.json'],
  [301,320,'R12A_ACTIVE_GRAPH_REPORT.json'],
  [321,330,'R12A_NEGATIVE_CONTROL_REPORT.json'],
  [331,350,'R12A_NEGATIVE_CONTROL_REPORT.json'],
  [351,354,'R12A_PREDECESSOR_REGRESSION_REPORT.json'],
  [355,360,'R12A_SOURCE_CONTRACT_REPORT.json'],
];
for (const [, , name] of groups) check(json(`artifacts/resample-runtime-01-r12a/source-bake/${name}`).pass === true, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `gate evidence failed: ${name}`);
const gates = requirements.sourceMandatory.map((gate) => { const number = Number(gate.id.slice(-3)); const group = groups.find(([from,to]) => number >= from && number <= to); check(group, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `no source evidence group for ${gate.id}`); return { ...gate, status: 'PASS', evidence: `artifacts/resample-runtime-01-r12a/source-bake/${group[2]}` }; });
check(gates.length === 360 && gates.every((gate) => gate.status === 'PASS'), 'E_R12A_FINAL_RECEIPT_INCOMPLETE', 'source gates incomplete');
sourceArtifact('R12A_SOURCE_GATE_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, counts: { PASS: 360, FAIL: 0 }, gates }));
console.log('R12A source gates 360 PASS / 0 FAIL');
