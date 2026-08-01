import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('app/src/legacy/generated-legacy-manifest.json', 'utf8'));
const adapter = fs.readFileSync('app/src/legacy/legacy-runtime-adapter.ts', 'utf8');
const generator = fs.readFileSync('tools/generate-legacy-audit.mjs', 'utf8');
const failures = [];

const inline = manifest.entries.find((entry) => entry.id === 'dadum.legacy.index-inline-01.mjs');
if (!inline?.declaredGlobalWrites.includes('__ΔK_webpLazyInit')) failures.push('exact Unicode global ownership missing');
if (inline?.declaredGlobalWrites.includes('__')) failures.push('truncated Unicode global ownership remains');
if (manifest.globalRegistryPolicy !== 'inventory-only') failures.push('global registry is not inventory-only');
if (adapter.includes('...legacyRuntimeManifest.globalRegistry')) failures.push('global registry still grants runtime admission');
if (!adapter.includes('record.declaredGlobalWrites') || !adapter.includes('this.#ownershipIndex') || !adapter.includes('this.#pendingDeferredGlobalClaims')) failures.push('module-local admission with temporal ownership context missing');
if (!generator.includes('\\p{ID_Start}') || !generator.includes('\\p{ID_Continue}')) failures.push('Unicode identifier grammar missing');
if (!generator.includes('collectModuleGraphGlobals')) failures.push('static module graph ownership collector missing');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('PASS GATE-R1-R3-GLOBAL-OWNERSHIP Unicode identifier exactness / static module graph ownership / inventory-only global registry');
