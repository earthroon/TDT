import path from 'node:path';
import { ARTIFACT_DIR, ROOT, discoverLegacyStaticAdmission, writeJson } from './build-emit-01-lib.mjs';
const manifest = discoverLegacyStaticAdmission({ root: ROOT });
writeJson(path.join(ROOT, 'app', 'src', 'legacy', 'generated-legacy-static-admission.json'), manifest);
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_LEGACY_STATIC_ADMISSION_MANIFEST.json'), manifest);
console.log(`PASS BUILD-EMIT-01 legacy static admission ${manifest.recordCount}/${manifest.fullLegacyFileCount} ${manifest.digest}`);
