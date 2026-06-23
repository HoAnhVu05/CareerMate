# Script restart Backend CareerMate
# Usage: .\RESTART_BACKEND.ps1

Write-Host "=== RESTART CAREERMATE BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Check if ports are already in use
$ports = @(8761, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)
$portNames = @{
    8761 = "Eureka Server"
    8080 = "API Gateway"
    8081 = "User Service"
    8082 = "Job Service"
    8083 = "Content Service"
    8084 = "Notification Service"
    8085 = "Learning Service"
    8086 = "AI Service"
    8087 = "Admin Service"
}

$portsInUse = @()

Write-Host "Checking for running services..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $processId = netstat -ano | findstr ":$port " | Select-String "LISTENING" | ForEach-Object { ($_ -split " +")[-1] } | Select-Object -Unique
    if ($processId) {
        $serviceName = $portNames[$port]
        $portsInUse += @{Port=$port; PID=$processId; Name=$serviceName}
        Write-Host "  Found: $serviceName on port $port (PID: $processId)" -ForegroundColor Gray
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "`nStopping $($portsInUse.Count) running services..." -ForegroundColor Yellow
    foreach ($item in $portsInUse) {
        Write-Host "  Stopping $($item.Name) on port $($item.Port) (PID: $($item.PID))..." -ForegroundColor Gray
        $result = taskkill /PID $item.PID /F 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    [OK] $($item.Name) stopped" -ForegroundColor Green
        } else {
            Write-Host "    [WARN] Could not stop $($item.Name)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nWaiting 3 seconds for processes to fully terminate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Verify all ports are free
    $stillRunning = @()
    foreach ($port in $ports) {
        $processId = netstat -ano | findstr ":$port " | Select-String "LISTENING" | ForEach-Object { ($_ -split " +")[-1] } | Select-Object -Unique
        if ($processId) {
            $stillRunning += $port
        }
    }
    
    if ($stillRunning.Count -gt 0) {
        Write-Host "`nWarning: Some ports are still in use: $($stillRunning -join ', ')" -ForegroundColor Yellow
        Write-Host "Attempting to force kill..." -ForegroundColor Yellow
        foreach ($port in $stillRunning) {
            $processId = netstat -ano | findstr ":$port " | Select-String "LISTENING" | ForEach-Object { ($_ -split " +")[-1] } | Select-Object -Unique
            if ($processId) {
                taskkill /PID $processId /F 2>&1 | Out-Null
            }
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Host "All services stopped successfully" -ForegroundColor Green
} else {
    Write-Host "No running services found" -ForegroundColor Green
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "Starting all services..." -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Wait a bit more before starting
Start-Sleep -Seconds 2

# Call the main startup script
& ".\CHAY_BACKEND.ps1"
