#!/usr/bin/env pwsh

# ECLIP QUICK CHECK - PowerShell Version
# Usage: .\scripts\db-quick-check.ps1 -OutputFile db-results.log

param(
    [string]$OutputFile = "db-check-results.txt"
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Write-Section {
    param(
        [string]$Title,
        [string]$Icon = "📋"
    )
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "$Icon $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Check {
    param(
        [string]$Status = "✓",
        [string]$Message,
        [ValidateSet("Success", "Error", "Warning", "Info")]
        [string]$Type = "Info"
    )
    
    $color = @{
        "Success" = "Green"
        "Error"   = "Red"
        "Warning" = "Yellow"
        "Info"    = "White"
    }[$Type]
    
    Write-Host "  $Status $Message" -ForegroundColor $color
}

# Start
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              ECLIP DATABASE QUICK HEALTH CHECK                             ║" -ForegroundColor Cyan
Write-Host "║                        $timestamp" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Environment
Write-Section "ENVIRONMENT & CONFIGURATION" "📋"

# Check .env.local
if (Test-Path ".env.local") {
    Write-Check "✅" ".env.local found"
    $envContent = Get-Content ".env.local"
    $dbUrlLine = $envContent | Select-String "DATABASE_URL"
    if ($dbUrlLine) {
        Write-Check "✅" "DATABASE_URL configured"
    } else {
        Write-Check "❌" "DATABASE_URL NOT found in .env.local" "Error"
    }
} else {
    Write-Check "❌" ".env.local NOT found" "Error"
}

# Check node
Write-Host ""
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Check "✅" "Node.js installed: $nodeVersion"
} else {
    Write-Check "❌" "Node.js NOT installed" "Error"
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Check "✅" "npm installed: $npmVersion"
} else {
    Write-Check "❌" "npm NOT installed" "Error"
}

# Dependencies
Write-Section "DEPENDENCIES" "📦"

if (Test-Path "node_modules") {
    Write-Check "✅" "node_modules directory exists"
    
    if (Test-Path "node_modules/pg") {
        Write-Check "✅" "pg module installed"
    } else {
        Write-Check "⚠️" "pg module NOT found - needed for database checks" "Warning"
    }
} else {
    Write-Check "❌" "node_modules NOT found - run: npm install" "Error"
}

# Run audit if possible
Write-Section "DATABASE CHECK" "🗄️"

if ((Test-Path "node_modules/pg") -and (Test-Path ".env.local")) {
    Write-Host "Connecting to database..."
    Write-Host ""
    
    try {
        $output = node scripts/db-quick-check.js 2>&1
        Write-Host $output
    } catch {
        Write-Check "❌" "Failed to run database check: $_" "Error"
    }
} else {
    Write-Check "⚠️" "Cannot run database check - missing dependencies or .env.local" "Warning"
    Write-Host ""
    Write-Host "To fix, run:"
    Write-Host "  npm install"
}

# Summary
Write-Section "SUMMARY" "✨"
Write-Host "Next steps:"
Write-Host "  1. Review the output above"
Write-Host "  2. Fix any ❌ Critical issues"
Write-Host "  3. Address any ⚠️ Warnings"
Write-Host ""

# Save output
if ($OutputFile) {
    Write-Host "Saving output to: $OutputFile"
}

Write-Host ""
