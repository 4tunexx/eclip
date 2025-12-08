#!/usr/bin/env powershell
Set-Location "C:\Users\Airis\Desktop\eclip.pro\client-app"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Building electron app with NSIS installer (no code signing)..."

# Set environment variables to disable code signing completely
$env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
$env:WIN_CSC_LINK = ''
$env:WIN_CSC_KEY_PASSWORD = ''

# Build using npm run build:win which uses nsis target
& npm run build:win
