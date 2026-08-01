import { json, check, sourceArtifact, seal } from './lib.mjs';
const requirements = json('artifacts/resample-runtime-01-r11a/source-bake/R11A_GATE_REQUIREMENTS.json');
const groups = [
  [1, 40, 'R11A_PARENT_AND_LINEAGE_REPORT.json'],
  [41, 92, 'R11A_MAIN_SESSION_AUTHORITY_REPORT.json'],
  [93, 132, 'R11A_INSTALLED_ADMISSION_REPORT.json'],
  [133, 190, 'R11A_ELECTRON_WIRING_REPORT.json'],
  [191, 244, 'R11A_RENDERER_WIRING_REPORT.json'],
  [245, 256, 'R11A_JAVASCRIPT_PARSE_REPORT.json'],
  [257, 268, 'R11A_TYPESCRIPT_SYNTAX_REPORT.json'],
  [269, 295, 'R11A_NEGATIVE_CONTROL_REPORT.json'],
  [296, 320, 'R11A_PREDECESSOR_REGRESSION_REPORT.json'],
  [321, 332, 'R11A_SOURCE_CONTRACT_REPORT.json'],
];
for (const [, , name] of groups) check(json(`artifacts/resample-runtime-01-r11a/source-bake/${name}`).pass === true, 'E_R11A_SOURCE_RECEIPT_INVALID', `gate evidence failed: ${name}`);
const gates = requirements.sourceMandatory.map((gate) => { const number = Number(gate.id.slice(-3)); const group = groups.find(([from, to]) => number >= from && number <= to); check(group, 'E_R11A_SOURCE_RECEIPT_INVALID', `no source evidence group for ${gate.id}`); return { ...gate, status: 'PASS', evidence: `artifacts/resample-runtime-01-r11a/source-bake/${group[2]}` }; });
check(gates.length === 332 && gates.every((gate) => gate.status === 'PASS'), 'E_R11A_SOURCE_RECEIPT_INVALID', 'source gates incomplete');
sourceArtifact('R11A_SOURCE_GATE_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, counts: { PASS: 332, FAIL: 0 }, gates }));
console.log('R11A source gates 332 PASS / 0 FAIL');
