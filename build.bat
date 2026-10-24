@echo off
rem ============================================================
rem  HelloPlugin 2.0.0 build script
rem  Usage:  build.bat [JarName.jar]
rem  Every build that you load into ICN needs a NEW jar name,
rem  because WebSphere locks a loaded jar (File In Use).
rem  The script works from any folder (ICNLab root can be moved).
rem ============================================================
setlocal

set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_202
set PATH=%JAVA_HOME%\bin;%PATH%
set NAV="D:\IBM\ECMClient\lib\navigatorAPI.jar"
set SERVLET="D:\IBM\WebSphere\AppServer\plugins\javax.j2ee.servlet.jar"
set JACE="D:\IBM\WebSphere\AppServer\profiles\AppSrv01\installedApps\AppNode01Cell\navigator.ear\navigator.war\WEB-INF\lib\Jace.jar"

if "%~1"=="" (set JARNAME=HelloPlugin.jar) else (set JARNAME=%~1)

cd /d "%~dp0"
echo Building %JARNAME% from %CD%

if not exist src\com\training\icn\HelloPlugin.java (
    echo ERROR: src\com\training\icn\HelloPlugin.java not found
    exit /b 1
)
if not exist WebContent\HelloPluginV20.js (
    echo ERROR: WebContent\HelloPluginV20.js not found
    exit /b 1
)

if exist out rmdir /s /q out
mkdir out

javac -encoding UTF-8 -source 1.8 -target 1.8 -cp %NAV%;%SERVLET%;%JACE% -d out src\com\training\icn\*.java
if errorlevel 1 (
    echo ERROR: javac failed
    exit /b 1
)

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

rem Libraries of ICN must NOT be packaged inside the jar
jar tf %JARNAME% | findstr /b /c:"com/ibm/" >nul
if not errorlevel 1 (
    echo ERROR: com/ibm/ classes found inside the jar
    exit /b 1
)

rem Expected resources
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
