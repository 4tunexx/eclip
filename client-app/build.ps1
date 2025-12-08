#!/usr/bin/env powershell
Set-Location "C:\Users\Airis\Desktop\eclip.pro\client-app"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Building electron app..."
& npx electron-builder --win --publish=never
