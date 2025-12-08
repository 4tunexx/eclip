@echo off
REM Quick start script for testing the client in development

echo ================================
echo Starting EclipAC Client (Dev Mode)
echo ================================
echo.

cd client-app

echo Installing dependencies if needed...
if not exist "node_modules" (
    call npm install
)

echo.
echo Starting Electron app...
call npm start

cd ..
