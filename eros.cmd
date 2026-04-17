@echo off
REM eros — repo-local bootstrap shim
REM
REM Uso: desde la raiz del repo (despues de `git clone`), ejecutar:
REM   .\eros          (abre el wizard — compila la primera vez)
REM   .\eros list
REM   .\eros --help
REM
REM En el primer build te pregunta si queres instalarlo global. Si aceptas,
REM despues de reiniciar la shell podes tipear `eros` desde cualquier carpeta.

setlocal enabledelayedexpansion

REM --- 1. Si ya esta instalado global, delegar ---
set "EROS_PRIMARY=%LOCALAPPDATA%\Microsoft\WindowsApps\eros.exe"
set "EROS_FALLBACK=%LOCALAPPDATA%\eros\bin\eros.exe"
if exist "%EROS_PRIMARY%" (
  "%EROS_PRIMARY%" %*
  exit /b %ERRORLEVEL%
)
if exist "%EROS_FALLBACK%" (
  "%EROS_FALLBACK%" %*
  exit /b %ERRORLEVEL%
)

REM --- 2. Paths locales ---
set "REPO=%~dp0"
set "EROS_LOCAL=%REPO%cli\bin\eros.exe"

REM --- 3. Resolver Go (PATH o ruta default de Windows) ---
set "GOBIN="
where go >nul 2>&1 && set "GOBIN=go"
if "!GOBIN!"=="" if exist "C:\Program Files\Go\bin\go.exe" set "GOBIN=C:\Program Files\Go\bin\go.exe"
if "!GOBIN!"=="" goto :no_go

REM --- 4. Build si falta binario local ---
if exist "%EROS_LOCAL%" goto :run

echo.
echo   [eros] Compilando por primera vez...
pushd "%REPO%cli"
"!GOBIN!" build -o bin\eros.exe ./ >nul
set "BUILD_RC=!ERRORLEVEL!"
popd
if not "!BUILD_RC!"=="0" (
  echo   [eros] Build fallo con codigo !BUILD_RC!.
  exit /b !BUILD_RC!
)
echo   [eros] Listo.
echo.

REM --- 5. Oferta de instalacion global ---
echo   Queres instalar eros global para usarlo desde cualquier carpeta?
set "ANSWER=y"
set /p "ANSWER=  [Y/n]: "
if /i "!ANSWER!"=="n" goto :run
if /i "!ANSWER!"=="no" goto :run
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%REPO%scripts\install-cli.ps1"
echo.

REM --- 6. Ejecutar ---
:run
"%EROS_LOCAL%" %*
exit /b %ERRORLEVEL%

REM --- Error: Go no instalado ---
:no_go
echo.
echo   [eros] Go no esta instalado.
echo.
echo   Opciones para instalar Go 1.22+:
echo     winget install GoLang.Go
echo     choco install golang
echo     https://go.dev/dl/
echo.
exit /b 1
