# TDT-EXPORT-PROMOTION-01 Applied

## Status

`SOURCE_BAKED_UNPROMOTED`

This bake promotes the export ownership architecture at source level. It does not assert a production build, packaged Electron E2E, cross-format independent decode matrix, or a production promotion pointer mutation.

## Applied authority changes

1. Public Runtime API is stable at `dadum.runtime.export` with `apiVersion: 1`.
2. EW/R patch numbers are removed from the public export API identity.
3. Legacy `window.ExportManager` follows `REGISTERING -> SEALED -> ADOPTED -> RETIRED`.
4. Runtime receives a private exact codec-host capability. The public facade becomes a frozen tombstone.
5. Product export no longer returns a Blob URL or triggers an anchor download.
6. Electron owns bounded save sessions using 8 MiB chunks, sequence and offset checks, per-chunk SHA-256, full-output SHA-256, temporary file, fsync, on-disk verification, and rename.
7. `resize_export_bind.js` delegates immediately to the stable Runtime API instead of building a second Renderer export pipeline.
8. Export Receipt vEP01 binds the stable API, retired facade state, host save receipt, source promotion state, and whole-build rollback policy.
9. Rollback is whole-build-only. Legacy and per-encoder fallback are forbidden.

## Source verification

- R1-R7 inherited gates: PASS
- EW01: 20/20 PASS
- EW02: 24/24 PASS
- EW03: 30/30 PASS
- EW04: 32/32 PASS
- EW05: 38/38 PASS
- EW06: 44/44 PASS
- EW07: 46/46 PASS
- EP01: 54/54 PASS
- Strict TypeScript closure with isolated framework declarations: PASS
- Legacy facade runtime smoke: PASS
- Runtime manifest determinism: PASS
- Worker manifest determinism: PASS

## Promotion blockers retained

- The internal npm registry returned HTTP 503 during dependency installation.
- `package-lock.json` is not consistent with the declared Vue, Pinia, and Vite graph.
- `vue-tsc` and `vite` are unavailable in this environment.
- Production Vite build was not completed.
- Packaged Electron E2E was not run.
- Electron save protocol was wired but not executed in Electron.
- Cross-format independent decoder verification is incomplete.
- PSD CMYK production LCMS validation is incomplete.
- JXL independent round-trip remains incomplete.
- MODJPEG single-thread artifact rebuild remains incomplete.

The production pointer remains unchanged and the candidate remains `SOURCE_BAKED_UNPROMOTED`.
