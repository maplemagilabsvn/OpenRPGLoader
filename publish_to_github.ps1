# ==============================================================================
#           OPENRPGLOADER - PUSH TO GITHUB (POWERSHELL)
# ==============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "          OPENRPGLOADER - PUSH TO GITHUB (1-CLICK)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$gitExe = "git"
if (Test-Path "C:\Program Files\Git\cmd\git.exe") {
    $gitExe = "C:\Program Files\Git\cmd\git.exe"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe") {
    $gitExe = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
} elseif (Test-Path "C:\Program Files (x86)\Git\cmd\git.exe") {
    $gitExe = "C:\Program Files (x86)\Git\cmd\git.exe"
}

Write-Host "[*] Git executable: $gitExe" -ForegroundColor Green
Write-Host "[*] Target Remote: https://github.com/maplemagilabsvn/OpenRPGLoader.git" -ForegroundColor Green
Write-Host "[*] Branch: main" -ForegroundColor Green
Write-Host ""
Write-Host "[*] Executing git push -u origin main..." -ForegroundColor Yellow
Write-Host "[*] (If a GitHub login dialog or browser window appears, please authorize)" -ForegroundColor Yellow
Write-Host ""

& $gitExe push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[*] Trying to reconcile with existing remote files (git pull --rebase)..." -ForegroundColor Yellow
    & $gitExe pull origin main --rebase
    & $gitExe push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==============================================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! OpenRPGLoader has been published to GitHub!" -ForegroundColor Green
    Write-Host "  Repository: https://github.com/maplemagilabsvn/OpenRPGLoader" -ForegroundColor Green
    Write-Host "==============================================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[!] Push failed. Please check network or GitHub login authorization." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit..."
