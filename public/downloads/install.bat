@echo off
REM EclipAC Installation Script
REM This script installs the EclipAC anticheat client

setlocal enabledelayedexpansion

echo ========================================
echo EclipAC Anti-Cheat Client Installer
echo ========================================
echo.

REM Get the directory where this script is located
set INSTALL_DIR=%USERPROFILE%\AppData\Local\EclipAC
set EXE_NAME=EclipAC.exe
set CURRENT_DIR=%~dp0

echo Installing EclipAC to: %INSTALL_DIR%
echo.

REM Create installation directory
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo [✓] Created installation directory
) else (
    echo [✓] Installation directory already exists
)

REM Copy executable
if exist "%CURRENT_DIR%%EXE_NAME%" (
    copy /Y "%CURRENT_DIR%%EXE_NAME%" "%INSTALL_DIR%\%EXE_NAME%"
    echo [✓] Copied EclipAC.exe
) else (
    echo [✗] Error: EclipAC.exe not found in current directory
    exit /b 1
)

REM Register protocol handler
echo Registering eclip:// protocol handler...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.eclip" /f >nul 2>&1
reg add "HKCU\Software\Classes\eclip" /ve /d "URL:EclipAC Protocol" /f >nul 2>&1
reg add "HKCU\Software\Classes\eclip" /v "URL Protocol" /d "" /f >nul 2>&1
reg add "HKCU\Software\Classes\eclip\shell\open\command" /ve /d "\"%INSTALL_DIR%\%EXE_NAME%\" \"%%1\"" /f >nul 2>&1
echo [✓] Protocol handler registered

REM Create start menu shortcut
set PROGRAMS=%APPDATA%\Microsoft\Windows\Start Menu\Programs
if not exist "%PROGRAMS%\EclipAC" (
    mkdir "%PROGRAMS%\EclipAC"
)

REM Create desktop shortcut using PowerShell (more reliable)
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $lnk = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\EclipAC.lnk'); $lnk.TargetPath = '%INSTALL_DIR%\%EXE_NAME%'; $lnk.Save()" >nul 2>&1

echo [✓] Created desktop shortcut

REM Launch the application
echo.
echo Installation complete!
echo Launching EclipAC...
start "" "%INSTALL_DIR%\%EXE_NAME%"

exit /b 0
