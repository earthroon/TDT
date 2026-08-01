import { read, check } from './lib.mjs';
import { SPEC, SOURCE_PASS, PACKAGED_PENDING } from './identity.mjs';
export function parseGateCatalog() {
  const text = read(SPEC);
  const source = [...text.matchAll(/`(R9AP1R1-S\d{3})`\s*\|\s*([^|\n]+)/g)].map((match) => ({ id: match[1], requirement: match[2].trim() }));
  const packaged = [...text.matchAll(/`(R9AP1R1-P\d{3})`\s*\|\s*([^|\n]+)/g)].map((match) => ({ id: match[1], requirement: match[2].trim() }));
  check(source.length === SOURCE_PASS, 'E_R9AP1R1_GATE_CATALOG', 'source gate count mismatch', { actual: source.length });
  check(packaged.length === PACKAGED_PENDING, 'E_R9AP1R1_GATE_CATALOG', 'packaged gate count mismatch', { actual: packaged.length });
  check(new Set(source.map((row) => row.id)).size === source.length, 'E_R9AP1R1_GATE_DUPLICATE', 'duplicate source gate');
  check(new Set(packaged.map((row) => row.id)).size === packaged.length, 'E_R9AP1R1_GATE_DUPLICATE', 'duplicate packaged gate');
  return Object.freeze({ source, packaged });
}
