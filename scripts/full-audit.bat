@echo off
REM ECLIP COMPLETE AUDIT & DIAGNOSTIC SCRIPT (Windows)
REM Run this: cmd /c scripts/full-audit.bat > audit-results.txt 2>&1
REM Then share the audit-results.txt file

setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════════════════════════════
echo                   ECLIP COMPLETE AUDIT ^& DIAGNOSTICS
echo ════════════════════════════════════════════════════════════════════════════
echo.

REM ============================================================================
REM 1. ENVIRONMENT CHECK
REM ============================================================================
echo 📋 SECTION 1: ENVIRONMENT ^& DEPENDENCIES
echo ────────────────────────────────────────────────────────────────────────────
echo.

echo Node version:
node --version 2>nul || echo ❌ Node not found
echo.

echo npm version:
npm --version 2>nul || echo ❌ npm not found
echo.

echo Database URL:
if defined DATABASE_URL (
    echo ✅ DATABASE_URL is set
) else (
    echo ❌ DATABASE_URL is NOT set
)
echo.

echo Environment file check:
if exist ".env.local" (
    echo ✅ .env.local exists
) else (
    echo ❌ .env.local NOT found
)
echo.

REM ============================================================================
REM 2. PACKAGE DEPENDENCIES
REM ============================================================================
echo 📦 SECTION 2: PACKAGE DEPENDENCIES
echo ────────────────────────────────────────────────────────────────────────────
echo.

echo Checking node_modules:
if exist "node_modules\" (
    echo ✅ node_modules directory exists
) else (
    echo ⚠️ node_modules NOT found - run: npm install
)
echo.

REM ============================================================================
REM 3. CODEBASE ANALYSIS
REM ============================================================================
echo 🔍 SECTION 3: CODEBASE ANALYSIS
echo ────────────────────────────────────────────────────────────────────────────
echo.

echo TypeScript files:
for /f %%A in ('dir /s /b src\*.ts src\*.tsx 2^>nul ^| find /c /v ""') do echo  Total: %%A files
echo.

echo Hardcoded values scan:
findstr /r /s "1\.23\|1\.45\|2\.50" src\*.ts src\*.tsx 2>nul
if errorlevel 1 (
    echo  ✅ No hardcoded K/D values found
) else (
    echo  ⚠️ Found potential hardcoded values above
)
echo.

echo Mock data scan:
findstr /r /s "mock\|fixture" src\*.ts src\*.tsx 2>nul | find /v "node_modules" | find /v "@testing-library" >nul
if errorlevel 1 (
    echo  ✅ No mock references found
) else (
    echo  ⚠️ Found mock references - check if they're in use
)
echo.

REM ============================================================================
REM 4. DATABASE CONNECTION TEST
REM ============================================================================
echo 🗄️ SECTION 4: DATABASE CONNECTION
echo ────────────────────────────────────────────────────────────────────────────
echo.

if exist "scripts\run-audit.js" (
    echo Running database audit...
    echo.
    node scripts\run-audit.js 2>&1
    if errorlevel 1 (
        echo ⚠️ Database connection test failed
    )
) else (
    echo ℹ️ run-audit.js not found
)
echo.

REM ============================================================================
REM 5. API ROUTES
REM ============================================================================
echo 🛣️ SECTION 5: API ROUTES
echo ────────────────────────────────────────────────────────────────────────────
echo.

echo API route files found:
for /r src\app\api %%F in (route.ts) do (
    set "file=%%F"
    set "file=!file:src\app\api\=!"
    set "file=!file:\=/!"
    set "file=!file:/route.ts=!"
    echo  ✓ /api/!file!
)
echo.

REM ============================================================================
REM 6. DATABASE SCHEMA
REM ============================================================================
echo 📊 SECTION 6: DATABASE SCHEMA
echo ────────────────────────────────────────────────────────────────────────────
echo.

if exist "src\lib\db\schema.ts" (
    echo Schema tables defined:
    for /f "tokens=3" %%A in ('findstr "export const" src\lib\db\schema.ts ^| findstr "pgTable"') do (
        echo  ✓ %%A
    )
) else (
    echo ❌ schema.ts not found
)
echo.

REM ============================================================================
REM 7. AUTHENTICATION FILES
REM ============================================================================
echo 🔐 SECTION 7: AUTHENTICATION
echo ────────────────────────────────────────────────────────────────────────────
echo.

echo Auth-related files:
for /r src %%F in (*auth*.ts) do echo  ✓ %%F
for /r src %%F in (*auth*.tsx) do echo  ✓ %%F
echo.

REM ============================================================================
REM 8. SUMMARY
REM ============================================================================
echo.
echo ════════════════════════════════════════════════════════════════════════════
echo                            AUDIT COMPLETE
echo ════════════════════════════════════════════════════════════════════════════
echo.
echo ✅ Next steps:
echo    1. Review the output above for any warnings or errors
echo    2. Check database audit results
echo    3. Address any hardcoded values
echo    4. Fix any compilation errors
echo.
echo 📝 To share results with support:
echo    Save this output and upload it
echo.

pause
