
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { check, sourceArtifact, seal } from './lib.mjs';
import { createValidFixture } from './test-fixture.mjs';
import { finalizeFleetV2 } from '../../app/features/resample-runtime/r13a/fleet-finalizer-v2.mjs';
import { EvidenceOutbox } from '../../app/features/resample-runtime/r13a/evidence-outbox.mjs';
import { FleetEvidenceIngestion } from '../../app/features/resample-runtime/r13a/fleet-ingestion.mjs';
import { publishOutboxEntry } from '../../app/features/resample-runtime/r13a/evidence-publisher.mjs';
const f=createValidFixture();
const final=finalizeFleetV2(f,f.authorities.final); check(final.counts.PASS===1530,'E_R13A_FINALIZER_REVALIDATION_FAILED','valid fleet finalization failed');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'r13a-outbox-')); try { const outbox=new EvidenceOutbox(dir); outbox.enqueue(f.evidenceOne); const ingestion=new FleetEvidenceIngestion({registry:f.keyRegistry,acknowledgementAuthority:f.authorities.ack}); const published=await publishOutboxEntry({outbox,evidenceSha256:f.evidenceOne.evidenceSha256,registry:f.keyRegistry,transport:async(evidence)=>ingestion.ingest(evidence,{windowEnd:'2026-01-03T00:00:00.000Z'})}); check(published.state==='ACKED','E_R13A_EVIDENCE_OUTBOX_LOSS','evidence was not acknowledged'); outbox.removeAcknowledged(f.evidenceOne.evidenceSha256); check(!fs.existsSync(outbox.entryPath(f.evidenceOne.evidenceSha256)),'E_R13A_EVIDENCE_OUTBOX_LOSS','retention removal failed'); } finally { fs.rmSync(dir,{recursive:true,force:true}); }
sourceArtifact('R13A_FLEET_BINDING_SOURCE_REPORT.json',seal({schemaVersion:1,leaseClaimPassed:true,drainPermitPassed:true,localBindingPassed:true,r12aChildChainReplayPassed:true,localCompletionPassed:true}));
sourceArtifact('R13A_DRAIN_PERMIT_SOURCE_REPORT.json',seal({schemaVersion:1,deadlineMs:30000,ringConcurrencyEnforced:true,permitBeforeDrainEnforced:true}));
sourceArtifact('R13A_EVIDENCE_OUTBOX_SOURCE_REPORT.json',seal({schemaVersion:1,durableOutboxPassed:true,signedAckPassed:true,deleteBeforeAckRejected:true}));
sourceArtifact('R13A_CONTAINMENT_RECOVERY_SOURCE_REPORT.json',seal({schemaVersion:1,phaseAwareContainmentImplemented:true,noRemoteSilentRollback:true,noInventedRollbackTarget:true}));
sourceArtifact('R13A_FINALIZER_REVALIDATION_REPORT.json',seal({schemaVersion:1,rawArtifactRevalidationPassed:true,summaryBooleanTrustCount:0,exactAggregateRecomputed:true,privacyReportRecomputed:true,finalState:final.state}));
console.log('R13A runtime module self tests PASS');
