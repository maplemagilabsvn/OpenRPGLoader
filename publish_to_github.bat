@echo off
setlocal
cd /d "%~dp0"

echo ==============================================================================
echo           OPENRPGLOADER - PUSH TO GITHUB (1-CLICK)
echo ==============================================================================
echo.

set "GIT_EXE=git"
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"
) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set "GIT_EXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "GIT_EXE=C:\Program Files (x86)\Git\cmd\git.exe"
)

echo [*] Using Git: %GIT_EXE%
echo [*] Target Remote: https://github.com/maplemagilabsvn/OpenRPGLoader.git
echo [*] Branch: main
echo.
echo [*] Executing git push -u origin main...
echo [*] (If a GitHub login dialog or browser window appears, please authorize)
echo.

"%GIT_EXE%" push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [*] Trying to reconcile with existing remote files (git pull --rebase)...
    "%GIT_EXE%" pull origin main --rebase
    "%GIT_EXE%" push -u origin main
)

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo   SUCCESS! OpenRPGLoader has been published to GitHub!
    echo   Repository: https://github.com/maplemagilabsvn/OpenRPGLoader
    echo ==============================================================================
) else (
    echo.
    echo [!] Push failed. Please check network or GitHub login authorization.
)

echo.
pause
