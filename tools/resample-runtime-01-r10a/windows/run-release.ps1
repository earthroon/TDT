param([Parameter(Mandatory=$true)][string]$RunId)
$ErrorActionPreference = 'Stop'
$env:DADUM_R10A_RUN_ID = $RunId
$env:DADUM_R10A_RELEASE_MODE = '1'
node tools/resample-runtime-01-r10a/rebuild.mjs
node tools/resample-runtime-01-r10a/admit.mjs
node tools/resample-runtime-01-r10a/promote.mjs
node tools/resample-runtime-01-r10a/drill.mjs
node tools/resample-runtime-01-r10a/finalize-release.mjs
node tools/resample-runtime-01-r10a/restore-lineage.mjs
node tools/resample-runtime-01-r10a/verify-release.mjs
