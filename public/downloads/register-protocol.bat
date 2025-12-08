@echo off
:: EclipAC Protocol Registration Script
:: This script registers the eclip:// protocol handler for Windows

echo ========================================
echo EclipAC Protocol Registration
echo ========================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo.
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "EXE_PATH=%SCRIPT_DIR%EclipAC.exe"

:: Check if EclipAC.exe exists
if not exist "%EXE_PATH%" (
    echo ERROR: EclipAC.exe not found in the same folder as this script
    echo.
    echo Expected location: %EXE_PATH%
    echo.
    echo Please make sure EclipAC.exe is in the same folder as this script.
    pause
    exit /b 1
)

echo Found EclipAC.exe at: %EXE_PATH%
echo.
echo Registering eclip:// protocol handler...

:: Register the protocol in Windows Registry
reg add "HKCU\Software\Classes\eclip" /ve /d "URL:eclip Protocol" /f >nul 2>&1
reg add "HKCU\Software\Classes\eclip" /v "URL Protocol" /d "" /f >nul 2>&1
reg add "HKCU\Software\Classes\eclip\DefaultIcon" /ve /d "\"%EXE_PATH%\",0" /f >nul 2>&1
reg add "HKCU\Software\Classes\eclip\shell\open\command" /ve /d "\"%EXE_PATH%\" \"%%1\"" /f >nul 2>&1

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Protocol registered successfully
    echo ========================================
    echo.
    echo You can now use eclip:// links to launch EclipAC
    echo The anticheat will start automatically when you click "Launch Client"
    echo on the eclip.pro website.
    echo.
) else (
    echo.
    echo ERROR: Failed to register protocol
    echo Please make sure you ran this script as Administrator
    echo.
)

pause
