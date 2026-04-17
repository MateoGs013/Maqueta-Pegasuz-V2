# install-cli.ps1 -- installs `eros` globally so you can run it without `./`.
#
# Primary target: %LOCALAPPDATA%\Microsoft\WindowsApps\eros.exe
#   This directory is ALWAYS on $env:PATH by default on Windows 10/11 (since
#   Windows added execution aliases for Store apps). Installing here makes
#   `eros` available in every shell immediately -- no PATH update, no restart.
#
# Fallback target: %LOCALAPPDATA%\eros\bin\eros.exe
#   If the primary target is locked, we copy here and patch user PATH. This
#   path needs a shell restart to take effect.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\install-cli.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\install-cli.ps1 -Force

param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot       = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$cliDir         = Join-Path $repoRoot "cli"
$binDir         = Join-Path $cliDir "bin"
$primaryDir     = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
$primaryTarget  = Join-Path $primaryDir "eros.exe"
$fallbackDir    = Join-Path $env:LOCALAPPDATA "eros\bin"
$fallbackTarget = Join-Path $fallbackDir "eros.exe"

# --- 1. Resolve go ---
$goCmd = (Get-Command go -ErrorAction SilentlyContinue).Source
if (-not $goCmd) {
  $candidate = "C:\Program Files\Go\bin\go.exe"
  if (Test-Path $candidate) { $goCmd = $candidate }
}
if (-not $goCmd) {
  Write-Host "go not found. Install Go 1.22+ from https://go.dev/dl/ first." -ForegroundColor Red
  exit 1
}

# --- 2. Stamp version ---
$commit = try { (git -C $repoRoot rev-parse --short HEAD) 2>$null } catch { "unknown" }
if (-not $commit) { $commit = "unknown" }
$date = (Get-Date -Format "yyyy-MM-dd")
$version = "0.1.0 (commit $commit, built $date)"

Write-Host ""
Write-Host "Building eros $version" -ForegroundColor Cyan
Write-Host ""

# --- 3. Build binary ---
Push-Location $cliDir
try {
  if (-not (Test-Path $binDir)) { New-Item -ItemType Directory -Force -Path $binDir | Out-Null }
  $script:buildOutput = Join-Path $binDir "eros.exe"
  # Stamp the commit hash into main.version via -ldflags. The version string
  # must not contain spaces (Windows CreateProcess splits args on spaces), so
  # we use a semver-compatible +commit.hash suffix.
  $versionStamp = "0.1.0+commit.$commit"
  $ldflags = "-X main.version=$versionStamp"
  & $goCmd build -ldflags $ldflags -o $script:buildOutput .\
  if ($LASTEXITCODE -ne 0) { throw "go build failed" }
} finally {
  Pop-Location
}

# --- 3.5 Kill any running eros so we can overwrite the locked binary ---
# Without this step, a running eros.exe (from another terminal or an open
# wizard) locks the target path; Copy-Item silently falls through to the
# fallback and the user keeps running the stale global binary.
$running = Get-Process -Name "eros" -ErrorAction SilentlyContinue
if ($running) {
  Write-Host "Terminating running eros process(es) so we can overwrite the binary..." -ForegroundColor Yellow
  $running | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 200
}

# --- 4. Try primary target first (no PATH changes needed) ---
function Try-Copy {
  param([string]$target, [string]$targetDir)
  try {
    if (-not (Test-Path $targetDir)) {
      New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    }
    if (Test-Path $target) { Remove-Item -Force $target -ErrorAction SilentlyContinue }
    Copy-Item -Force $script:buildOutput $target
    return $true
  } catch {
    return $false
  }
}

$installedTo = $null

if (Try-Copy -target $primaryTarget -targetDir $primaryDir) {
  $installedTo = $primaryTarget
  Write-Host "Installed to $primaryTarget" -ForegroundColor Green
  Write-Host "This path is on your default PATH -- 'eros' works in every shell, now." -ForegroundColor Green
} elseif (Try-Copy -target $fallbackTarget -targetDir $fallbackDir) {
  $installedTo = $fallbackTarget
  Write-Host "Installed to $fallbackTarget (fallback)" -ForegroundColor Yellow
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if ($userPath -notlike "*$fallbackDir*") {
    $newPath = "$userPath;$fallbackDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Added $fallbackDir to user PATH." -ForegroundColor Yellow
    Write-Host "Open a NEW shell for 'eros' to be available." -ForegroundColor Yellow
  }
} else {
  Write-Host "Could not install eros to any known location." -ForegroundColor Red
  Write-Host "Binary is available at $script:buildOutput -- copy it to a directory on your PATH manually." -ForegroundColor Red
  exit 1
}

# --- 5. Smoke-test if possible ---
$erosOnPath = (Get-Command eros -ErrorAction SilentlyContinue).Source
if ($erosOnPath -and $erosOnPath -eq $installedTo) {
  Write-Host ""
  Write-Host "Verified: 'eros' resolves to $erosOnPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Run 'eros' from anywhere to launch the wizard." -ForegroundColor Green
Write-Host ""
