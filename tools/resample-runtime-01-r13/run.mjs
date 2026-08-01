await import('./generate-source-artifacts.mjs');
await import('./verify-parent-freeze.mjs');
await import('./verify-runtime-self-tests.mjs');
await import('./verify-negative-controls.mjs');
await import('./verify-source-contract.mjs');
await import('./verify-predecessor-regression.mjs');
await import('./finalize-source.mjs');
