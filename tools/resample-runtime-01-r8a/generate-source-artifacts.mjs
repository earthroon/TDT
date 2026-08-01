import {parseGateRequirements,sourceArtifact,seal,check} from './lib.mjs';
import {SOURCE_GATE_COUNT,PHYSICAL_GATE_COUNT} from './identity.mjs';
const requirements=parseGateRequirements();
check(requirements.sourceMandatory.length===SOURCE_GATE_COUNT,'E_R8A_GATE_CATALOG_INVALID','source gate catalog count mismatch',requirements.sourceMandatory.length);
check(requirements.physicalRevalidation.length===PHYSICAL_GATE_COUNT,'E_R8A_GATE_CATALOG_INVALID','physical gate catalog count mismatch',requirements.physicalRevalidation.length);
sourceArtifact('R8A_GATE_REQUIREMENTS.json',seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R8A',...requirements}));
console.log(`R8A gate catalog ${requirements.sourceMandatory.length} source / ${requirements.physicalRevalidation.length} physical`);
