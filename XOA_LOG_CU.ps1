# Script xóa log cũ (giữ lại log hiện tại)
# Usage: .\XOA_LOG_CU.ps1

$logFile = "backend\logs\careermate.log"
$logDir = "backend\logs"

Write-Host "=== XOA LOG CU ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $logDir)) {
    Write-Host "ERROR: Thu muc log khong ton tai: $logDir" -ForegroundColor Red
    exit 1
}

# List old log files
$oldLogs = Get-ChildItem $logDir -Filter "*.log.*" -File
$gzLogs = Get-ChildItem $logDir -Filter "*.gz" -File

if ($oldLogs.Count -eq 0 -and $gzLogs.Count -eq 0) {
    Write-Host "OK: Khong co log cu nao de xoa" -ForegroundColor Green
    exit 0
}

Write-Host "Tim thay cac file log cu:" -ForegroundColor Yellow
if ($oldLogs) {
    $oldLogs | ForEach-Object { Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Gray }
}
if ($gzLogs) {
    $gzLogs | ForEach-Object { Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Gray }
}

Write-Host ""
$confirm = Read-Host "Ban co chac muon xoa cac file log cu nay? (y/n)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    $deleted = 0
    if ($oldLogs) {
        $oldLogs | Remove-Item -Force
        $deleted += $oldLogs.Count
    }
    if ($gzLogs) {
        $gzLogs | Remove-Item -Force
        $deleted += $gzLogs.Count
    }
    Write-Host "OK: Da xoa $deleted file log cu" -ForegroundColor Green
} else {
    Write-Host "Da huy" -ForegroundColor Yellow
}
