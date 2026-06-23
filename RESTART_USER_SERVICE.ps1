# Restart User Service Script
Write-Host "====== RESTARTING USER SERVICE ======" -ForegroundColor Cyan

$userServicePath = "d:\Github\CareerMate\backend\microservices\user-service"

# Kill existing user-service process
Write-Host "Stopping existing User Service..." -ForegroundColor Yellow
Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*user-service*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Waiting for process to stop..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start user-service
Write-Host "Starting User Service on port 8081..." -ForegroundColor Green
cd $userServicePath

# Start in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run" -WorkingDirectory $userServicePath

Write-Host "User Service is starting..." -ForegroundColor Green
Write-Host "Wait 30 seconds for it to fully start" -ForegroundColor Yellow
Write-Host "Check health: http://localhost:8081/actuator/health" -ForegroundColor Cyan
