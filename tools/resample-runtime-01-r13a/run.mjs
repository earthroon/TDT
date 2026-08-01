
await import('./generate-source-artifacts.mjs');
await import('./verify-parent-lineage.mjs');
await import('./verify-authority-wiring.mjs');
await import('./verify-runtime-self-tests.mjs');
await import('./verify-negative-controls.mjs');
await import('./verify-electron-renderer-wiring.mjs');
await import('./verify-javascript-parse.mjs');
await import('./verify-typescript-syntax.mjs');
await import('./verify-active-graph.mjs');
await import('./verify-predecessor-regression.mjs');
await import('./verify-source-contract.mjs');
await import('./gate-source.mjs');
await import('./finalize-source.mjs');
