@echo off
REM ============================================================
REM EclipAC Anti-Cheat - PRODUCTION BUILD
REM ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo  ECLIPAC ANTI-CHEAT CLIENT - PRODUCTION BUILD v2.4.1
echo  Platform: eclip.pro
echo ============================================================
echo.

if not exist "client-app" (
    echo Error: client-app folder not found!
    pause
    exit /b 1
)

echo [1/5] Converting logo to icon format...
cd client-app
if exist "scripts\convert-icon.js" (
    call node scripts\convert-icon.js
) else (
    echo ⚠ Icon script not found, skipping...
)

echo.
echo [2/5] Installing dependencies...
echo Please wait, this may take 2-3 minutes...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo Error installing dependencies
    cd ..
    pause
    exit /b 1
)

echo.
echo [3/5] Installing build tools...
call npm install --legacy-peer-deps --save-dev electron-builder

echo.
echo [4/5] Building Windows executable...
echo Please wait, this may take 3-5 minutes...
call npx electron-builder --win

if %errorlevel% neq 0 (
    echo Error during build
    echo Attempting alternative build method...
    call npm run build:win
)

echo.
echo [5/5] Packaging for distribution...
if not exist "..\public\downloads" mkdir "..\public\downloads"

REM Find the built EXE
for /f %%f in ('dir /b /od dist\*.exe 2^>nul ^| findstr /r "Setup"') do (
    set "EXE=%%f"
)

if defined EXE (
    copy "dist\%EXE%" "..\public\downloads\EclipAC-Setup.exe" >nul
    echo ✓ Installer packaged: EclipAC-Setup.exe
    
    REM Get file size
    for %%A in ("..\public\downloads\EclipAC-Setup.exe") do set "SIZE=%%~zA"
    echo ✓ File size: %SIZE% bytes
) else (
    echo ⚠ Warning: EXE not found in dist folder
    echo   Check dist\ folder manually
)

cd ..

echo.
echo ============================================================
echo  🎉 BUILD COMPLETE!
echo ============================================================
echo.
echo Build Summary:
echo   Platform: eclip.pro
echo   Version: 2.4.1 (Production)
echo   Type: Anti-Cheat Client
echo.
echo Features:
echo   ✓ Real-time process monitoring
echo   ✓ Cheat tool detection
echo   ✓ Admin reporting with IP tracking
echo   ✓ System tray integration
echo   ✓ Match IP logging
echo   ✓ Suspicious activity alerts
echo   ✓ Hidden window support
echo.
echo Distribution:
echo   Location: public\downloads\EclipAC-Setup.exe
echo   Download API: /api/download/client
echo   Protocol: eclip://launch
echo.
echo 🚀 Ready for deployment!
echo ============================================================
echo.

pause
