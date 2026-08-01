param([Parameter(Mandatory=$true)][string]$EvidenceFile,[Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference = 'Stop'
if (!(Test-Path -LiteralPath $EvidenceFile -PathType Leaf)) { throw 'E_R13_FLEET_EVIDENCE_INVALID: evidence file missing' }
$e = Get-Content -LiteralPath $EvidenceFile -Raw | ConvertFrom-Json
if ($null -eq $e.signature -or $null -eq $e.evidenceSha256) { throw 'E_R13_FLEET_EVIDENCE_INVALID: unsigned evidence' }
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Destination) | Out-Null
Copy-Item -LiteralPath $EvidenceFile -Destination $Destination -Force
