# ============================================================
# Script để chạy tất cả Microservices của CareerMate
# ============================================================

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "     STARTING ALL CAREERMATE MICROSERVICES     " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# Cấu hình
$basePath = "C:\xampp\htdocs\CareerMate\backend\microservices"
$javaHome = "C:\Program Files\Java\jdk-23"
$mavenPath = "C:\Program Files\apache-maven-3.9.12\bin"

# Set environment variables
$env:JAVA_HOME = $javaHome
$env:PATH = "$mavenPath;$env:PATH"

# Danh sách services và ports
$services = @(
    @{Name="eureka-server"; Port=8761; Path="eureka-server"; Order=1},
    @{Name="api-gateway"; Port=8080; Path="api-gateway"; Order=2},
    @{Name="user-service"; Port=8081; Path="user-service"; Order=3},
    @{Name="job-service"; Port=8082; Path="job-service"; Order=4},
    @{Name="content-service"; Port=8083; Path="content-service"; Order=5},
    @{Name="notification-service"; Port=8084; Path="notification-service"; Order=6},
    @{Name="learning-service"; Port=8085; Path="learning-service"; Order=7},
    @{Name="ai-service"; Port=8086; Path="ai-service"; Order=8},
    @{Name="admin-service"; Port=8087; Path="admin-service"; Order=9}
)

# Function để kill process trên port
function Kill-Port {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($processId in $processIds) {
            Write-Host "  [!] Killing process $processId on port $Port" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
}

# Function để check service health
function Test-ServiceHealth {
    param([string]$Name, [int]$Port, [int]$TimeoutSeconds = 5)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/actuator/health" -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Kill các process đang chạy trên các ports
Write-Host "`nCleaning up existing processes..." -ForegroundColor Yellow
foreach ($svc in $services) {
    Kill-Port -Port $svc.Port
}

# Start services theo thứ tự
Write-Host "`nStarting services..." -ForegroundColor Green

foreach ($svc in $services | Sort-Object Order) {
    Write-Host "`n[$($svc.Order)] Starting $($svc.Name) on port $($svc.Port)..." -ForegroundColor Cyan
    
    $servicePath = Join-Path $basePath $svc.Path
    $jarFile = Join-Path $servicePath "target\$($svc.Name)-1.0.0.jar"
    
    # Check if JAR exists
    if (-not (Test-Path $jarFile)) {
        Write-Host "  [X] JAR file not found: $jarFile" -ForegroundColor Red
        Write-Host "  Building $($svc.Name)..." -ForegroundColor Yellow
        Push-Location $servicePath
        mvn clean package -DskipTests 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [X] Build failed for $($svc.Name)" -ForegroundColor Red
            Pop-Location
            continue
        }
        Pop-Location
    }
    
    # Start service
    Push-Location $servicePath
    Start-Process java -ArgumentList "-jar", "target\$($svc.Name)-1.0.0.jar" -WindowStyle Hidden
    Pop-Location
    
    Write-Host "  [OK] $($svc.Name) started" -ForegroundColor Green
    
    # Wait before starting next service (except for last one)
    if ($svc.Order -lt $services.Count) {
        Start-Sleep -Seconds 3
    }
}

# Wait for all services to start
Write-Host "`nWaiting 40 seconds for all services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

# Check service health
Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "           SERVICE STATUS CHECK           " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

$runningCount = 0
$totalCount = $services.Count

foreach ($svc in $services | Sort-Object Order) {
    $isRunning = Test-ServiceHealth -Name $svc.Name -Port $svc.Port
    if ($isRunning) {
        Write-Host "[OK] $($svc.Name) - RUNNING (port $($svc.Port))" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "[X] $($svc.Name) - NOT RUNNING (port $($svc.Port))" -ForegroundColor Red
    }
}

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "Total: $runningCount/$totalCount services running ($([math]::Round($runningCount/$totalCount*100, 0))%)" -ForegroundColor $(if ($runningCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host "===========================================================" -ForegroundColor Cyan

# Show Eureka registry if available
Write-Host "`nEureka Service Registry:" -ForegroundColor Cyan
try {
    $eureka = Invoke-WebRequest -Uri "http://localhost:8761/eureka/apps" -TimeoutSec 3 -UseBasicParsing
    $xml = [xml]$eureka.Content
    $registeredServices = $xml.applications.application.name | Select-Object -Unique | Sort-Object
    if ($registeredServices) {
        foreach ($service in $registeredServices) {
            Write-Host "  [OK] $service" -ForegroundColor Green
        }
    } else {
        Write-Host "  [!] No services registered yet (may need more time)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [X] Cannot access Eureka Server" -ForegroundColor Red
}

Write-Host "`nTips:" -ForegroundColor Cyan
Write-Host "  - View logs: Check individual service windows" -ForegroundColor White
Write-Host "  - Eureka Dashboard: http://localhost:8761" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  - Stop all services: Press Ctrl+C or close windows" -ForegroundColor White
Write-Host "`n===========================================================" -ForegroundColor Cyan
