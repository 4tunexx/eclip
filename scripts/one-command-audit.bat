@echo off
REM ECLIP ONE-COMMAND AUDIT (Windows)
REM Run this to get complete audit with single command

setlocal enabledelayedexpansion

REM Create timestamped output file
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set OUTPUT_FILE=audit_results_%mydate%_%mytime%.txt

echo.
echo ════════════════════════════════════════════════════════════════════════════
echo                    ECLIP COMPLETE AUDIT REPORT
echo                    Generated: %date% %time%
echo                    Output: %OUTPUT_FILE%
echo ════════════════════════════════════════════════════════════════════════════
echo.
echo Step 1/2: Quick Verification...
echo.
) > %OUTPUT_FILE%

node scripts/instant-verify.js 2>&1 >> %OUTPUT_FILE%

echo.
echo Step 2/2: Database Deep Check...
echo. >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
echo ════════════════════════════════════════════════════════════════════════════ >> %OUTPUT_FILE%
echo                        DATABASE AUDIT RESULTS
echo ════════════════════════════════════════════════════════════════════════════ >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

node scripts/db-quick-check.js 2>&1 >> %OUTPUT_FILE%

echo.
echo ════════════════════════════════════════════════════════════════════════════ >> %OUTPUT_FILE%
echo                          AUDIT REPORT COMPLETE >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
echo  File saved to: %OUTPUT_FILE% >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
echo  Next Steps: >> %OUTPUT_FILE%
echo    1. Review the output >> %OUTPUT_FILE%
echo    2. Look for [XXX] critical and [!!!] warnings >> %OUTPUT_FILE%
echo    3. Share this file with support >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
echo ════════════════════════════════════════════════════════════════════════════ >> %OUTPUT_FILE%

echo.
echo ════════════════════════════════════════════════════════════════════════════
echo                          AUDIT REPORT COMPLETE
echo.
echo  File saved to: %OUTPUT_FILE%
echo.
echo  Next Steps:
echo    1. Review the output
echo    2. Look for [XXX] critical and [!!!] warnings
echo    3. Share this file with support
echo.
echo ════════════════════════════════════════════════════════════════════════════
echo.

pause
