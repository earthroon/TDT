param([Parameter(Mandatory=$true)][string]$Source,[Parameter(Mandatory=$true)][string]$Target)
$ErrorActionPreference = 'Stop'
$sourceFull = [System.IO.Path]::GetFullPath($Source)
$targetFull = [System.IO.Path]::GetFullPath($Target)
if ([System.IO.Path]::GetPathRoot($sourceFull) -ne [System.IO.Path]::GetPathRoot($targetFull)) { throw 'E_R10_ATOMIC_REPLACE_FAILED: source and target must share a volume' }
if (-not (Test-Path -LiteralPath $sourceFull -PathType Leaf)) { throw 'E_R10_ATOMIC_REPLACE_FAILED: source missing' }
if (Test-Path -LiteralPath $targetFull -PathType Leaf) {
  $backup = "$targetFull.r10-backup-$PID"
  [System.IO.File]::Replace($sourceFull,$targetFull,$backup,$true)
  Remove-Item -LiteralPath $backup -Force
} else {
  [System.IO.File]::Move($sourceFull,$targetFull)
}
