import {sourceArtifact,seal,hashFile} from './lib.mjs';import {IDS,RINGS,CRITICAL_BREAKERS,PRIVACY_FORBIDDEN_FIELDS,EVIDENCE_ALLOWED_FIELDS,SOURCE_STATE} from './identity.mjs';import {DEFAULT_PRIVACY_PROFILE} from '../../app/features/resample-runtime/r13/privacy-view.mjs';
const mk=(schemaId,required,properties={})=>({$schema:'https://json-schema.org/draft/2020-12/schema',schemaVersion:1,$id:schemaId,type:'object',additionalProperties:false,required,properties});
const schemas={
 R13_ROLLOUT_PLAN_SCHEMA:mk(IDS.plan,['rolloutId','planGeneration','targetBuildId','targetPackageContentId','ringDefinitions','planSha256','signature']),
 R13_ENROLLMENT_SCHEMA:mk(IDS.enrollment,['installationEnrollmentId','source']),
 R13_COHORT_ASSIGNMENT_SCHEMA:mk(IDS.cohort,['rolloutId','planDigest','cohortBucket','cohortDigest']),
 R13_ADMISSION_LEASE_SCHEMA:mk(IDS.lease,['rolloutId','planDigest','ringId','installationRolloutPseudonym','cohortBucket','targetBuildId','targetPackageContentId','expectedLocalR10Generation','expectedLocalR10RawSha256','leaseNonce','notBefore','expiresAt','leaseSha256','signature']),
 R13_EVIDENCE_ENVELOPE_SCHEMA:mk(IDS.evidence,['rolloutId','planDigest','ringId','installationRolloutPseudonym','evidenceSequence','evidenceNonce','buildId','packageContentId','evidenceSha256','signature']),
 R13_AGGREGATE_SCHEMA:mk(IDS.aggregate,['rolloutId','planDigest','ringId','admittedInstallations','validEvidenceInstallations','missingEvidenceInstallations','totals','inputSetDigest']),
 R13_CONTAINMENT_DIRECTIVE_SCHEMA:mk(IDS.containment,['rolloutId','planDigest','targetBuildId','targetPackageContentId','containmentGeneration','expiresAt','directiveSha256','signature']),
 R13_ROLLBACK_RECOMMENDATION_SCHEMA:mk(IDS.rollback,['rolloutId','planDigest','recommendations','pointerMutationPerformed']),
};
for(const [name,value] of Object.entries(schemas))sourceArtifact(`${name}.json`,value);
sourceArtifact('R13_PRIVACY_PROFILE.json',seal({...DEFAULT_PRIVACY_PROFILE,forbiddenFields:[...PRIVACY_FORBIDDEN_FIELDS],evidenceAllowlist:[...EVIDENCE_ALLOWED_FIELDS]}));
sourceArtifact('R13_CONTRACT_MANIFEST.json',seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R13',state:SOURCE_STATE,authority:{plan:'R13',lease:'R13',aggregate:'R13',localR10:'R10',localR12:'R12',localR11:'R11'},schemaIds:IDS,rings:RINGS,criticalBreakers:CRITICAL_BREAKERS,sourceGateCount:192,fleetGateCount:408,productionPointerMutationForbidden:true,localActivationPointerMutationForbidden:true,specSha256:hashFile('specs/TDT-RESAMPLE-RUNTIME-01-R13_MULTI_INSTALLATION_COHORT_ROLLOUT_CANARY_RING_ADMISSION_FLEET_EVIDENCE_AGGREGATION_BAD_RELEASE_CONTAINMENT_PRIVACY_PRESERVING_ROLLOUT_RECEIPT_SEAL_SPEC.md')}));
console.log('R13 source schema artifacts generated');
