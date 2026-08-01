import { IMPLEMENTATION_FILES } from './identity.mjs';
import { check, exists, sha256File, sourceArtifact, seal } from './lib.mjs';
const rows=IMPLEMENTATION_FILES.map((relativePath)=>{check(exists(relativePath),'E_R9AP1R1_IMPLEMENTATION_FILE_MISSING','implementation file missing',{relativePath});return{relativePath,sha256:sha256File(relativePath)};});
const receipt=seal({schemaVersion:1,receiptKind:'r9a-p1-r1-implementation-manifest',fileCount:rows.length,rows});sourceArtifact('R9AP1R1_IMPLEMENTATION_MANIFEST.json',receipt);console.log(`R9A-P1-R1 implementation manifest PASS ${rows.length} files`);
