param([Parameter(Mandatory=$true)][string]$PackageRoot)
$ErrorActionPreference='Stop'
# The packaged executor must replace this source capability with an admitted handle enumerator.
[pscustomobject]@{ packageRoot=$PackageRoot; admittedEnumerator=$false; openHandleCount=$null; status='PENDING_PACKAGED_WINDOWS_EXECUTION' } | ConvertTo-Json -Depth 4
