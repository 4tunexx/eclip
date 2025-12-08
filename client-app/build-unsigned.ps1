#!/usr/bin/env powershell
Set-Location "C:\Users\Airis\Desktop\eclip.pro\client-app"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Building electron app without code signing..."
$env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
$env:WIN_CSC_LINK = ''
$env:WIN_CSC_KEY_PASSWORD = ''
$env:CSC_KEY_PASSWORD = ''
& npx electron-builder --win --publish=never -c.win.certificateFile=null -c.win.certificatePassword=null -c.forceCodeSigning=false
