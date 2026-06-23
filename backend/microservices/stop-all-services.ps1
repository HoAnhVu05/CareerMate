# ============================================================
# Script để dừng tất cả Microservices của CareerMate
# ============================================================

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "     🛑 STOPPING ALL CAREERMATE MICROSERVICES 🛑     " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# Danh sách ports
$ports = @(8761, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)

$stoppedCount = 0

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction Stop
                Write-Host "  🛑 Stopping process $pid on port $port ($($process.ProcessName))" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction Stop
                $stoppedCount++
            } catch {
                Write-Host "  ⚠️  Could not stop process $pid" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n✅ Stopped $stoppedCount process(es)" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
