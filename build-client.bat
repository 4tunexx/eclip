@echo off
REM Build script for EclipAC Windows Client

echo ================================
echo Building EclipAC Windows Client
echo ================================
echo.

cd client-app

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b %errorlevel%
)

echo.
echo [2/4] Building Windows executable...
call npm run build:win
if %errorlevel% neq 0 (
    echo Error: Failed to build executable
    exit /b %errorlevel%
)

echo.
echo [3/4] Copying installer to public folder...
if not exist "..\public\downloads" mkdir "..\public\downloads"

REM Find the built installer (it might have version in name)
for %%f in (dist\*.exe) do (
    copy "%%f" "..\public\downloads\EclipAC-Setup.exe"
    echo Copied %%f to public\downloads\EclipAC-Setup.exe
)

echo.
echo [4/4] Build complete!
echo.
echo ================================
echo Installer location: public\downloads\EclipAC-Setup.exe
echo Download URL: http://localhost:3000/api/download/client
echo ================================
echo.
echo The client is ready for distribution!
echo Users can now download it from your website.

cd ..
