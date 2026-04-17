# eros — repo-local bootstrap shim (PowerShell native)
#
# Uso desde la raiz del repo:
#   .\eros.ps1            # abre el wizard
#   .\eros.ps1 --version
#   .\eros.ps1 list
#
# En el primer build te pregunta si queres instalarlo global.

$ErrorActionPreference = 'Stop'

$repo       = $PSScriptRoot
$erosLocal  = Join-Path $repo 'cli\bin\eros.exe'
$erosPrimary  = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps\eros.exe'
$erosFallback = Join-Path $env:LOCALAPPDATA 'eros\bin\eros.exe'

# --- 1. Si ya esta instalado global, delegar al binario global ---
foreach ($target in @($erosPrimary, $erosFallback)) {
    if (Test-Path $target) {
        & $target @args
        exit $LASTEXITCODE
    }
}

# --- 2. Resolver Go ---
$go = (Get-Command go -ErrorAction SilentlyContinue).Source
if (-not $go) {
    $candidate = 'C:\Program Files\Go\bin\go.exe'
    if (Test-Path $candidate) { $go = $candidate }
}
if (-not $go) {
    Write-Host ""
    Write-Host "  [eros] Go no esta instalado." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Instala Go 1.22+:"
    Write-Host "    winget install GoLang.Go"
    Write-Host "    choco install golang"
    Write-Host "    https://go.dev/dl/"
    Write-Host ""
    exit 1
}

# --- 3. Build si falta binario ---
$firstBuild = -not (Test-Path $erosLocal)
if ($firstBuild) {
    Write-Host ""
    Write-Host "  [eros] Compilando por primera vez (puede tardar 1-2 min)..." -ForegroundColor Cyan
    Write-Host ""
    Push-Location (Join-Path $repo 'cli')
    try {
        & $go build -o 'bin\eros.exe' ./
        if ($LASTEXITCODE -ne 0) { throw "build failed" }
    } catch {
        Write-Host ""
        Write-Host "  [eros] Build fallo." -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host ""
    Write-Host "  [eros] Compilado." -ForegroundColor Green
    Write-Host ""
}

# --- 4. Oferta de install global (solo despues del primer build) ---
if ($firstBuild) {
    Write-Host "  Queres instalar ``eros`` global para usarlo desde cualquier carpeta?"
    $answer = Read-Host "  [Y/n]"
    if (-not $answer) { $answer = 'y' }
    if ($answer -notmatch '^[nN]') {
        Write-Host ""
        $installScript = Join-Path $repo 'scripts\install-cli.ps1'
        & $installScript
        Write-Host ""
    }
}

# --- 5. Run ---
& $erosLocal @args
exit $LASTEXITCODE
