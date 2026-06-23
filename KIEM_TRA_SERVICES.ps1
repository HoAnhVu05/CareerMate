# Script kiem tra trang thai services
Write-Host "`n=== KIEM TRA TRANG THAI SERVICES ===" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Eureka Server"; Port=8761},
    @{Name="API Gateway"; Port=8080},
    @{Name="User Service"; Port=8081},
    @{Name="Job Service"; Port=8082},
    @{Name="Content Service"; Port=8083},
    @{Name="Notification Service"; Port=8084},
    @{Name="Learning Service"; Port=8085},
    @{Name="AI Service"; Port=8086},
    @{Name="Admin Service"; Port=8087}
)

$running = 0
foreach ($svc in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)/actuator/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] $($svc.Name) (port $($svc.Port)) - RUNNING" -ForegroundColor Green
        $running++
    } catch {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            Write-Host "[OK] $($svc.Name) (port $($svc.Port)) - RUNNING" -ForegroundColor Green
            $running++
        } catch {
            Write-Host "[X] $($svc.Name) (port $($svc.Port)) - NOT RUNNING" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== TONG KET: $running/9 services dang chay ===" -ForegroundColor $(if ($running -eq 9) { "Green" } else { "Yellow" })
Write-Host ""

if ($running -eq 9) {
    Write-Host "TAT CA SERVICES DA CHAY THANH CONG!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs:" -ForegroundColor Cyan
    Write-Host "   - Eureka Dashboard: http://localhost:8761" -ForegroundColor White
    Write-Host "   - API Gateway: http://localhost:8080" -ForegroundColor White
    Write-Host "   - API Base: http://localhost:8080/api" -ForegroundColor White
} else {
    Write-Host "Mot so services chua san sang. Vui long doi them vai giay." -ForegroundColor Yellow
}
