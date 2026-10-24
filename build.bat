@echo off
rem ============================================================
rem  HelloPlugin build script (portable)
rem  Usage:  build.bat [JarName.jar]
rem
rem  JDK  : javac from PATH, else JAVA_HOME, else C:\Program Files\Java\jdk1.8*
rem  Libs : every *.jar in the local lib folder joins the classpath
rem         (fill lib once with setup-lib.bat, see README.md)
rem
rem  Every build that you load into ICN needs a NEW jar name,
rem  because WebSphere locks a loaded jar (File In Use).
rem  The script works from any folder: copy the project anywhere.
rem ============================================================
setlocal enabledelayedexpansion

cd /d "%~dp0"
if "%~1"=="" (set JARNAME=HelloPlugin17.jar) else (set JARNAME=%~1)
echo Building %JARNAME% from %CD%

rem ---------- 1. JDK ----------
echo.
echo [1/5] JDK
where javac >nul 2>nul && goto jdk_found
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\javac.exe" set "PATH=%JAVA_HOME%\bin;%PATH%"
where javac >nul 2>nul && goto jdk_found
for /d %%D in ("%ProgramFiles%\Java\jdk1.8*") do set "PATH=%%~fD\bin;%PATH%"
where javac >nul 2>nul && goto jdk_found
echo ERROR: javac was not found. Install JDK 8, or set JAVA_HOME to the JDK folder.
exit /b 1
:jdk_found
where javac
javac -version

rem ---------- 2. libraries from lib\ ----------
echo.
echo [2/5] Libraries in lib\
set "CP="
set JARCOUNT=0
for %%J in (lib\*.jar) do (
    if defined CP (set "CP=!CP!;%%J") else (set "CP=%%J")
    set /a JARCOUNT+=1
    echo   %%~nxJ
)
if "!JARCOUNT!"=="0" (
    echo ERROR: the lib folder has no jar files. Run setup-lib.bat once, or copy the jars into lib - see README.md
    exit /b 1
)

rem the classes we compile against must be inside lib - the jar file names do not matter
set "TMPLIST=%TEMP%\hello_jar_list.txt"
set HAS_NAV=0
set HAS_SERVLET=0
set HAS_JACE=0
for %%J in (lib\*.jar) do (
    jar tf "%%J" > "!TMPLIST!" 2>nul
    findstr /c:"com/ibm/ecm/extension/Plugin.class" "!TMPLIST!" >nul && set HAS_NAV=1
    findstr /c:"javax/servlet/http/HttpServletRequest.class" "!TMPLIST!" >nul && set HAS_SERVLET=1
    findstr /c:"com/filenet/api/core/Factory.class" "!TMPLIST!" >nul && set HAS_JACE=1
)
if exist "!TMPLIST!" del "!TMPLIST!"

set MISSING=0
if "!HAS_NAV!"=="0" (
    echo ERROR: no jar in lib contains com.ibm.ecm.extension.Plugin - add navigatorAPI.jar
    set MISSING=1
)
if "!HAS_SERVLET!"=="0" (
    echo ERROR: no jar in lib contains javax.servlet.http.HttpServletRequest - add javax.j2ee.servlet.jar
    set MISSING=1
)
if "!HAS_JACE!"=="0" (
    echo ERROR: no jar in lib contains com.filenet.api.core.Factory - add Jace.jar
    set MISSING=1
)
if "!MISSING!"=="1" exit /b 1
echo OK: !JARCOUNT! jar files, all required libraries found.

rem ---------- 3. compile ----------
echo.
echo [3/5] Compiling
if not exist src\com\training\icn\HelloPlugin.java (
    echo ERROR: src\com\training\icn\HelloPlugin.java not found - run build.bat from the project folder
    exit /b 1
)
if not exist WebContent\HelloPluginV20.js (
    echo ERROR: WebContent\HelloPluginV20.js not found - run build.bat from the project folder
    exit /b 1
)

if exist out rmdir /s /q out
mkdir out

javac -encoding UTF-8 -source 1.8 -target 1.8 -Xlint:-options -cp "!CP!" -d out src\com\training\icn\*.java
if errorlevel 1 (
    echo ERROR: javac failed
    exit /b 1
)

rem ---------- 4. package ----------
echo.
echo [4/5] Packaging %JARNAME%

rem ICN looks for resources in <package>/WebContent/ inside the jar
xcopy WebContent out\com\training\icn\WebContent /E /I /Y /Q
if errorlevel 1 (
    echo ERROR: xcopy failed
    exit /b 1
)

jar cfm %JARNAME% manifest.txt -C out .
if errorlevel 1 (
    echo ERROR: jar failed
    exit /b 1
)

echo.
echo ---- jar contents ----
jar tf %JARNAME%

rem ---------- 5. verify ----------
echo.
echo [5/5] Verifying

rem Libraries of ICN must NOT be packaged inside the jar
jar tf %JARNAME% | findstr /b /c:"com/ibm/" >nul
if not errorlevel 1 (
    echo ERROR: com/ibm/ classes found inside the jar
    exit /b 1
)

call :need com/training/icn/WebContent/HelloPluginV20.js || exit /b 1
call :need com/training/icn/WebContent/HelloPluginV20.css || exit /b 1
call :need com/training/icn/WebContent/helloPluginDojo/HelloStrings.js || exit /b 1
call :need com/training/icn/WebContent/helloPluginDojo/HelloPropertiesPane.js || exit /b 1
call :need com/training/icn/WebContent/helloPluginDojo/HelloFeature.js || exit /b 1
call :need com/training/icn/WebContent/helloPluginDojo/templates/HelloFeature.html || exit /b 1
call :need com/training/icn/WebContent/helloPluginDojo/templates/HelloPropertiesPane.html || exit /b 1

echo.
echo OK: %JARNAME% is ready. Load it from Administration Desktop - Plug-ins.
endlocal
exit /b 0

:need
jar tf %JARNAME% | findstr /c:"%~1" >nul
if errorlevel 1 (
    echo ERROR: %~1 is missing from the jar
    exit /b 1
)
exit /b 0
