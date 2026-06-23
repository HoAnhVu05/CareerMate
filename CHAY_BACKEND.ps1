# Script chay Backend CareerMate
# Usage: .\CHAY_BACKEND.ps1

Write-Host "=== CAREERMATE BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Check if ports are already in use
$ports = @(8761, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)
$portsInUse = @()

foreach ($port in $ports) {
    $processId = netstat -ano | findstr ":$port " | Select-String "LISTENING" | ForEach-Object { ($_ -split " +")[-1] } | Select-Object -Unique
    if ($processId) {
        $portsInUse += @{Port = $port; PID = $processId }
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "The following ports are already in use. Auto-stopping them..." -ForegroundColor Yellow
    foreach ($item in $portsInUse) {
        Write-Host "  Port $($item.Port) - PID: $($item.PID)" -ForegroundColor Yellow
        taskkill /PID $item.PID /F 2>&1 | Out-Null
    }
    Start-Sleep -Seconds 2
    Write-Host "Processes stopped" -ForegroundColor Green
}

# Set Java and Maven paths
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:PATH = "C:\Program Files\apache-maven-3.9.12\bin;$env:PATH"

# Check if Java is available
$javaVersion = java -version 2>&1 | Select-String "version"
if (-not $javaVersion) {
    Write-Host "Error: Java not found!" -ForegroundColor Red
    Write-Host "Please install Java JDK 23 or update JAVA_HOME" -ForegroundColor Yellow
    exit 1
}

# Check if Maven is available
$mvnVersion = mvn -version 2>&1 | Select-String "Apache Maven"
if (-not $mvnVersion) {
    Write-Host "Error: Maven not found!" -ForegroundColor Red
    Write-Host "Please install Maven or update PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "Java: $javaVersion" -ForegroundColor Green
Write-Host "Maven: $mvnVersion" -ForegroundColor Green
Write-Host ""

# Navigate to microservices directory
$basePath = Join-Path $PWD "backend\microservices"

# Services to start in order
$services = @(
    @{Name = "eureka-server"; Path = "eureka-server"; Port = 8761; Order = 1 },
    @{Name = "api-gateway"; Path = "api-gateway"; Port = 8080; Order = 2 },
    @{Name = "user-service"; Path = "user-service"; Port = 8081; Order = 3 },
    @{Name = "job-service"; Path = "job-service"; Port = 8082; Order = 4 },
    @{Name = "content-service"; Path = "content-service"; Port = 8083; Order = 5 },
    @{Name = "notification-service"; Path = "notification-service"; Port = 8084; Order = 6 },
    @{Name = "learning-service"; Path = "learning-service"; Port = 8085; Order = 7 },
    @{Name = "ai-service"; Path = "ai-service"; Port = 8086; Order = 8 },
    @{Name = "admin-service"; Path = "admin-service"; Port = 8087; Order = 9 }
)

Write-Host "Starting all Microservices with Spring Boot..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor Yellow
Write-Host "  - Eureka Server: http://localhost:8761" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  - User Service: http://localhost:8081" -ForegroundColor White
Write-Host "  - Job Service: http://localhost:8082" -ForegroundColor White
Write-Host "  - Content Service: http://localhost:8083" -ForegroundColor White
Write-Host "  - Notification Service: http://localhost:8084" -ForegroundColor White
Write-Host "  - Learning Service: http://localhost:8085" -ForegroundColor White
Write-Host "  - AI Service: http://localhost:8086" -ForegroundColor White
Write-Host "  - Admin Service: http://localhost:8087" -ForegroundColor White
Write-Host ""
Write-Host "API Base URL: http://localhost:8080/api" -ForegroundColor Yellow
Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting services in background..." -ForegroundColor Cyan
Write-Host ""

# Start services using mvn spring-boot:run in background
$jobs = @()
foreach ($svc in $services | Sort-Object Order) {
    $servicePath = Join-Path $basePath $svc.Path
    
    if (-not (Test-Path $servicePath)) {
        Write-Host "[$($svc.Order)] [X] Service path not found: $servicePath" -ForegroundColor Red
        continue
    }
    
    Write-Host "[$($svc.Order)] Starting $($svc.Name) on port $($svc.Port)..." -ForegroundColor Cyan
    
    # Start service in background job
    $job = Start-Job -ScriptBlock {
        param($svcPath, $svcName, $svcPort, $javaHome, $mavenPath)
        
        $env:JAVA_HOME = $javaHome
        $env:PATH = "$mavenPath;$env:PATH"
        
        Set-Location $svcPath
        mvn spring-boot:run 2>&1 | ForEach-Object {
            # Filter and show important messages
            if ($_ -match "Started|Tomcat started|BUILD|ERROR|Exception|Failed to start") {
                Write-Output "[$svcName] $_"
            }
        }
    } -ArgumentList $servicePath, $svc.Name, $svc.Port, $env:JAVA_HOME, "C:\Program Files\apache-maven-3.9.12\bin"
    
    $jobs += @{Job = $job; Name = $svc.Name; Port = $svc.Port }
    
    Write-Host "  [OK] $($svc.Name) starting..." -ForegroundColor Green
    
    # Wait before starting next service
    if ($svc.Order -lt $services.Count) {
        Start-Sleep -Seconds 3
    }
}

Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host "All services are starting in background" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Waiting for services to start (this may take 1-2 minutes)..." -ForegroundColor Yellow
Write-Host ""

# Monitor services
$maxWait = 120 # 2 minutes
$elapsed = 0
$checkInterval = 5

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    # Show progress every 10 seconds
    if ($elapsed % 10 -eq 0) {
        Write-Host "Waiting... ($elapsed seconds)" -ForegroundColor Gray
    }
    
    # Check if all services are running
    $running = 0
    foreach ($jobInfo in $jobs) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($jobInfo.Port)/actuator/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            $running++
        }
        catch {
            # Service not ready yet
        }
    }
    
    if ($running -eq $jobs.Count) {
        Write-Host "`n===========================================================" -ForegroundColor Green
        Write-Host "All services are running!" -ForegroundColor Green
        Write-Host "===========================================================" -ForegroundColor Green
        break
    }
}

# Final status
Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

$running = 0
foreach ($jobInfo in $jobs) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($jobInfo.Port)/actuator/health" -TimeoutSec 3 -UseBasicParsing
        Write-Host "[OK] $($jobInfo.Name) - RUNNING (port $($jobInfo.Port))" -ForegroundColor Green
        $running++
    }
    catch {
        Write-Host "[X] $($jobInfo.Name) - NOT RUNNING (port $($jobInfo.Port))" -ForegroundColor Red
    }
}

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "Total: $running/$($jobs.Count) services running" -ForegroundColor $(if ($running -eq $jobs.Count) { "Green" } else { "Yellow" })
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services are running in background jobs" -ForegroundColor Cyan
Write-Host "To view logs, check job output or service console" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Gray
Write-Host ""

# Keep script running and show job output
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Show any new output from jobs
        foreach ($jobInfo in $jobs) {
            $output = Receive-Job -Job $jobInfo.Job -ErrorAction SilentlyContinue
            if ($output) {
                $output | ForEach-Object {
                    Write-Host $_ -ForegroundColor Gray
                }
            }
        }
    }
}
catch {
    Write-Host "`nStopping all services..." -ForegroundColor Yellow
    foreach ($jobInfo in $jobs) {
        Stop-Job -Job $jobInfo.Job -ErrorAction SilentlyContinue
        Remove-Job -Job $jobInfo.Job -ErrorAction SilentlyContinue
    }
    Write-Host "All services stopped" -ForegroundColor Green
}
