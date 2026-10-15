@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

:: Them duong dan Git vao PATH neu chua co
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "PATH=%PATH%;C:\Program Files\Git\cmd"
) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Git\cmd"
) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "PATH=%PATH%;C:\Program Files (x86)\Git\cmd"
)

:: Chay trinh xuat ban qua PowerShell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish_to_github.ps1"

if %errorlevel% neq 0 (
    echo.
    pause
)
