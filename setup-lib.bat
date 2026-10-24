@echo off
rem ============================================================
rem  setup-lib.bat - run ONCE per machine, on the ICN server.
rem  Copies the three compile-time jars into the local lib folder,
rem  so build.bat needs no fixed paths afterwards.
rem
rem  If your installation differs, change the three paths below
rem  (README.md, section 2 shows how to find them).
rem ============================================================
setlocal
cd /d "%~dp0"

set "NAV_JAR=D:\IBM\ECMClient\lib\navigatorAPI.jar"
set "SERVLET_JAR=D:\IBM\WebSphere\AppServer\plugins\javax.j2ee.servlet.jar"
set "JACE_JAR=D:\IBM\WebSphere\AppServer\profiles\AppSrv01\installedApps\AppNode01Cell\navigator.ear\navigator.war\WEB-INF\lib\Jace.jar"

if not exist lib mkdir lib

set FAILED=0
call :copyjar "%NAV_JAR%" || set FAILED=1
call :copyjar "%SERVLET_JAR%" || set FAILED=1
call :copyjar "%JACE_JAR%" || set FAILED=1

echo.
if "%FAILED%"=="1" (
    echo Some jars were not copied. Fix the paths at the top of setup-lib.bat, or copy the files into lib by hand.
    exit /b 1
)
echo Done. Content of lib:
dir lib\*.jar /b
endlocal
exit /b 0

:copyjar
if not exist "%~1" (
    echo MISSING: "%~1"
    exit /b 1
)
copy /y "%~1" lib\ >nul
if errorlevel 1 (
    echo COPY FAILED: "%~1"
    exit /b 1
)
echo copied: %~nx1
exit /b 0
