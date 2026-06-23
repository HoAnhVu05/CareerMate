# Script chạy Frontend CareerMate
# Sử dụng Vite dev server

Write-Host "=== STARTING FRONTEND ===" -ForegroundColor Cyan

# Kiểm tra Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js từ: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Kiểm tra npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm chưa được cài đặt!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green

# Chuyển vào thư mục frontend
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Thư mục frontend không tồn tại!" -ForegroundColor Red
    exit 1
}

cd frontend

# Kiểm tra node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules chưa được cài đặt. Đang cài đặt dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi cài đặt dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies đã được cài đặt!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Vite dev server..." -ForegroundColor Yellow
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Chạy dev server
npm run dev

