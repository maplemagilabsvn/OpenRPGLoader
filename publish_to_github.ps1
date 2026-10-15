# ==============================================================================
#           🚀 OPENRPGLOADER - TRÌNH XUẤT BẢN GITHUB TỰ ĐỘNG (POWERSHELL)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "          🚀 OPENRPGLOADER - TRÌNH XUẤT BẢN GITHUB TỰ ĐỘNG (1-CLICK)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra Git
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    $commonPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )
    foreach ($p in $commonPaths) {
        if (Test-Path $p) {
            $env:PATH += ";$(Split-Path $p -Parent)"
            $gitCmd = Get-Command git -ErrorAction SilentlyContinue
            break
        }
    }
}

if (-not $gitCmd) {
    Write-Host "[!] CHƯA TÌM THẤY GIT TRÊN MÁY TÍNH CỦA BẠN!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Để đẩy mã nguồn lên GitHub, bạn cần cài đặt Git (chỉ mất 1 phút):" -ForegroundColor Yellow
    Write-Host "  1. Tải bộ cài chính thức tại: https://git-scm.com/download/win"
    Write-Host ""
    Read-Host "Nhấn Enter để thoát..."
    exit 1
}

Write-Host "[✓] Đã phát hiện Git trên hệ thống!" -ForegroundColor Green
git --version

# Đăng ký safe.directory để khắc phục lỗi quyền sở hữu NTFS trên Windows
$repoPath = (Get-Location).Path.Replace('\', '/')
git config --global --add safe.directory "$repoPath" 2>$null
Write-Host ""

# 2. Khởi tạo Git Repo nếu chưa có
if (-not (Test-Path ".git")) {
    Write-Host "[*] Đang khởi tạo Git repository (branch: main)..." -ForegroundColor Yellow
    git init -b main
    if ($LASTEXITCODE -ne 0) {
        git init
        git branch -M main
    }
} else {
    Write-Host "[✓] Thư mục .git đã tồn tại." -ForegroundColor Green
    git branch -M main 2>$null
}
Write-Host ""

# 3. Kiểm tra thông tin cấu hình Git User
$gitUser = git config user.name 2>$null
$gitEmail = git config user.email 2>$null

if (-not $gitUser) {
    $gitUser = Read-Host "Nhập Tên hoặc Nickname GitHub của bạn"
    if (-not $gitUser) { $gitUser = "OpenRPG Contributor" }
    git config user.name "$gitUser"
}
if (-not $gitEmail) {
    $gitEmail = Read-Host "Nhập Email GitHub của bạn"
    if (-not $gitEmail) { $gitEmail = "contributor@openrpgloader.org" }
    git config user.email "$gitEmail"
}
Write-Host "[✓] Tác giả: $gitUser <$gitEmail>" -ForegroundColor Green
Write-Host ""

# 4. Kiểm tra Remote Origin
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote) {
    Write-Host "[*] Đã cấu hình Remote Origin: $currentRemote" -ForegroundColor Yellow
    $ans = Read-Host "Bạn có muốn đẩy lên địa chỉ này không? (Y/N, mặc định: Y)"
    if ($ans -eq "N" -or $ans -eq "n") {
        $currentRemote = $null
    }
}

if (-not $currentRemote) {
    Write-Host "[*] Vui lòng tạo một repository mới trên GitHub (https://github.com/new)." -ForegroundColor Yellow
    Write-Host "    (Ví dụ: https://github.com/username/OpenRPGLoader.git)"
    Write-Host ""
    $repoUrl = Read-Host "Dán đường dẫn GitHub Repository của bạn vào đây"
    $repoUrl = $repoUrl.Trim().Trim('"').Trim("'")
    if (-not $repoUrl) {
        Write-Host "[!] Bạn chưa nhập đường dẫn Repository. Quá trình dừng lại." -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát..."
        exit 1
    }
    git remote remove origin 2>$null
    git remote add origin "$repoUrl"
} else {
    $repoUrl = $currentRemote
}
Write-Host ""

# 5. Thêm tệp và tạo Commit
Write-Host "[*] Đang chuẩn bị tệp (git add .)..." -ForegroundColor Yellow
git add .

Write-Host "[*] Đang tạo Commit..." -ForegroundColor Yellow
git commit -m "feat: initial release of OpenRPGLoader v1.0.0"
Write-Host ""

# 6. Đẩy lên GitHub
Write-Host "[*] Đang đẩy toàn bộ mã nguồn lên GitHub (git push -u origin main)..." -ForegroundColor Yellow
Write-Host "    (Trình duyệt hoặc cửa sổ đăng nhập GitHub có thể sẽ hiện lên để bạn xác thực)"
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[*] Đang thử giải quyết xung đột với file có sẵn trên GitHub (git pull --rebase)..." -ForegroundColor Yellow
    git pull origin main --rebase
    git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==============================================================================" -ForegroundColor Green
    Write-Host "  🎉 CHÚC MỪNG! DỰ ÁN OPENRPGLOADER ĐÃ ĐƯỢC XUẤT BẢN THÀNH CÔNG LÊN GITHUB!" -ForegroundColor Green
    Write-Host "  🌐 Repository: $repoUrl" -ForegroundColor Green
    Write-Host "==============================================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[!] Quá trình đẩy lên GitHub chưa thành công." -ForegroundColor Red
    Write-Host "    Vui lòng kiểm tra lại quyền truy cập hoặc đăng nhập trên cửa sổ trình duyệt." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Nhấn Enter để kết thúc..."
