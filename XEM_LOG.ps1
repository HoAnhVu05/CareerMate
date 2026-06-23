# Script xem log backend CareerMate
# Usage: .\XEM_LOG.ps1 [options]

param(
    [int]$Lines = 50,
    [string]$Filter = "",
    [switch]$Follow = $false,
    [switch]$Error = $false,
    [switch]$Info = $false
)

$logFile = "backend\logs\careermate.log"

if (-not (Test-Path $logFile)) {
    Write-Host "ERROR: Log file khong ton tai: $logFile" -ForegroundColor Red
    Write-Host "Backend co the chua duoc chay lan nao." -ForegroundColor Yellow
    exit 1
}

Write-Host "=== CAREERMATE BACKEND LOG ===" -ForegroundColor Cyan
Write-Host "File: $logFile" -ForegroundColor Gray
Write-Host ""

if ($Follow) {
    Write-Host "Dang theo doi log real-time (Ctrl+C de dung)..." -ForegroundColor Yellow
    Write-Host ""
    
    Get-Content $logFile -Wait -Tail $Lines | ForEach-Object {
        $line = $_
        
        # Apply filters
        if ($Filter -and $line -notmatch $Filter) {
            return
        }
        
        if ($Error -and $line -notmatch "ERROR|Exception|Error") {
            return
        }
        
        if ($Info -and $line -notmatch "INFO") {
            return
        }
        
        # Color code by log level
        if ($line -match "ERROR|Exception|Error") {
            Write-Host $line -ForegroundColor Red
        } elseif ($line -match "WARN|Warning") {
            Write-Host $line -ForegroundColor Yellow
        } elseif ($line -match "INFO") {
            Write-Host $line -ForegroundColor Green
        } elseif ($line -match "DEBUG") {
            Write-Host $line -ForegroundColor Gray
        } else {
            Write-Host $line
        }
    }
} else {
    # Show last N lines
    $content = Get-Content $logFile -Tail $Lines
    
    if ($Filter) {
        $content = $content | Select-String -Pattern $Filter
    }
    
    if ($Error) {
        $content = $content | Select-String -Pattern "ERROR|Exception|Error"
    }
    
    if ($Info) {
        $content = $content | Select-String -Pattern "INFO"
    }
    
    foreach ($line in $content) {
        # Color code by log level
        if ($line -match "ERROR|Exception|Error") {
            Write-Host $line -ForegroundColor Red
        } elseif ($line -match "WARN|Warning") {
            Write-Host $line -ForegroundColor Yellow
        } elseif ($line -match "INFO") {
            Write-Host $line -ForegroundColor Green
        } elseif ($line -match "DEBUG") {
            Write-Host $line -ForegroundColor Gray
        } else {
            Write-Host $line
        }
    }
}
