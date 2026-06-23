# Script tìm kiếm trong log
# Usage: .\TIM_KIEM_LOG.ps1 -Keyword "search term"

param(
    [Parameter(Mandatory=$true)]
    [string]$Keyword,
    
    [int]$Lines = 500
)

$logFile = "backend\logs\careermate.log"

if (-not (Test-Path $logFile)) {
    Write-Host "❌ Log file không tồn tại: $logFile" -ForegroundColor Red
    exit 1
}

Write-Host "=== TIM KIEM TRONG LOG ===" -ForegroundColor Cyan
Write-Host "Keyword: $Keyword" -ForegroundColor Yellow
Write-Host "File: $logFile" -ForegroundColor Gray
Write-Host ""

$content = Get-Content $logFile -Tail $Lines | Select-String -Pattern $Keyword -Context 1,1

if ($content) {
    $count = ($content | Measure-Object).Count
    Write-Host "Tìm thấy $count kết quả:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($item in $content) {
        if ($item.Line -match $Keyword) {
            Write-Host $item.Line -ForegroundColor Yellow
        } else {
            Write-Host $item.Line -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Không tìm thấy kết quả nào với keyword: $Keyword" -ForegroundColor Red
}
