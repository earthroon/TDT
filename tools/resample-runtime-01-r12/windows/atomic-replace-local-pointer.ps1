param([Parameter(Mandatory=$true)][string]$TempPath,[Parameter(Mandatory=$true)][string]$PointerPath)
$ErrorActionPreference='Stop'
if ([IO.Path]::GetPathRoot($TempPath) -ne [IO.Path]::GetPathRoot($PointerPath)) { throw 'E_R12_ATOMIC_REPLACE_FAILED: different volume' }
if ((Split-Path -Parent $TempPath) -ne (Split-Path -Parent $PointerPath)) { throw 'E_R12_ATOMIC_REPLACE_FAILED: temp must share pointer directory' }
[System.IO.File]::Move($TempPath,$PointerPath,$true)
