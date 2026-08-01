param([Parameter(Mandatory=$true)][string]$RunId,[Parameter(Mandatory=$true)][string]$ApprovalFile,[Parameter(Mandatory=$true)][string]$R9FinalReceipt,[Parameter(Mandatory=$true)][string]$FullProductReceipt)
$ErrorActionPreference='Stop'
$env:DADUM_R10_RUN_ID=$RunId
$env:DADUM_R10_APPROVAL_FILE=[System.IO.Path]::GetFullPath($ApprovalFile)
$env:DADUM_R9_FINAL_RECEIPT=[System.IO.Path]::GetFullPath($R9FinalReceipt)
$env:DADUM_R10_FULL_PRODUCT_RECEIPT=[System.IO.Path]::GetFullPath($FullProductReceipt)
$env:DADUM_R10_RELEASE_MODE='1'
if (-not $env:DADUM_R10_ALLOW_NETWORK) { $env:DADUM_R10_ALLOW_NETWORK='0' }
npm run admit:resample-runtime-01-r10
npm run promote:resample-runtime-01-r10
npm run drill:resample-runtime-01-r10
npm run finalize:resample-runtime-01-r10
