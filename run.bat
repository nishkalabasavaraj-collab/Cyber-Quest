@echo off
cd /d "%~dp0"
if not exist out mkdir out
javac --add-modules jdk.httpserver -d out src\cyberquest\*.java
if errorlevel 1 (
  echo Compilation failed. Check that JDK 17 or newer is installed.
  pause
  exit /b 1
)
java --add-modules jdk.httpserver -cp out cyberquest.Main
pause
