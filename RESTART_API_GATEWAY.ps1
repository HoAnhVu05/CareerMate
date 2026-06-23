# Script restart API Gateway only
# Usage: .\RESTART_API_GATEWAY.ps1

Write-Host "=== RESTART API GATEWAY ===" -ForegroundColor Cyan
Write-Host ""

$port = 8080
$serviceName = "API Gateway"

# Check if port is in use
Write-Host "Checking for running $serviceName..." -ForegroundColor Yellow
$processId = netstat -ano | findstr ":$port " | Select-String "LISTENING" | ForEach-Object { ($_ -split " +")[-1] } | Select-Object -Unique

if ($processId) {
    Write-Host "Found $serviceName on port $port (PID: $processId)" -ForegroundColor Gray
    Write-Host "Stopping $serviceName..." -ForegroundColor Yellow
    $result = taskkill /PID $processId /F 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $serviceName stopped" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Could not stop $serviceName" -ForegroundColor Yellow
    }
    
    Write-Host "Waiting 3 seconds for process to fully terminate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Verify port is free
    $stillRunning = netstat -ano | findstr ":$port " | Select-String "LISTENING" | ForEach-Object { ($_ -split " +")[-1] } | Select-Object -Unique
    if ($stillRunning) {
        Write-Host "Port $port is still in use. Force killing..." -ForegroundColor Yellow
        taskkill /PID $stillRunning /F 2>&1 | Out-Null
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "No running $serviceName found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting $serviceName..." -ForegroundColor Cyan
Write-Host ""

# Set Java and Maven paths
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:PATH = "C:\Program Files\apache-maven-3.9.12\bin;$env:PATH"

# Navigate to API Gateway directory
$apiGatewayPath = Join-Path $PWD "backend\microservices\api-gateway"

if (-not (Test-Path $apiGatewayPath)) {
    Write-Host "Error: API Gateway path not found: $apiGatewayPath" -ForegroundColor Red
    exit 1
}

Set-Location $apiGatewayPath

Write-Host "Building and starting API Gateway..." -ForegroundColor Yellow
Write-Host "API Gateway will be available at: http://localhost:8080" -ForegroundColor Green
Write-Host ""

# Run Spring Boot
mvn spring-boot:run
