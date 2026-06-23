# Script to insert sample packages into learning_service_db
# Usage: .\INSERT_PACKAGES.ps1

Write-Host "=== INSERTING SAMPLE PACKAGES ===" -ForegroundColor Cyan
Write-Host ""

$dbName = "learning_service_db"
$dbUser = "postgres"
$dbPassword = "Aa1234"
$sqlFile = "backend\microservices\learning-service\src\main\java\vn\careermate\learningservice\database\migrations\006_insert_sample_packages.sql"

# Try to find psql in common locations
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\xampp\postgresql\bin\psql.exe",
    "psql.exe"
)

$psql = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psql = $path
        Write-Host "Found psql at: $psql" -ForegroundColor Green
        break
    }
}

if (-not $psql) {
    # Try to find in PATH
    $psql = Get-Command psql -ErrorAction SilentlyContinue
    if ($psql) {
        $psql = $psql.Source
        Write-Host "Found psql in PATH: $psql" -ForegroundColor Green
    }
}

if (-not $psql) {
    Write-Host "[ERROR] psql not found. Please install PostgreSQL or add it to PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Run this SQL manually in pgAdmin or psql:" -ForegroundColor Yellow
    Write-Host "  File: $sqlFile" -ForegroundColor White
    exit 1
}

if (-not (Test-Path $sqlFile)) {
    Write-Host "[ERROR] SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Database: $dbName" -ForegroundColor White
Write-Host "SQL File: $sqlFile" -ForegroundColor White
Write-Host ""

try {
    $env:PGPASSWORD = $dbPassword
    $sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8
    
    Write-Host "Executing SQL script..." -ForegroundColor Yellow
    $result = $sqlContent | & $psql -U $dbUser -d $dbName -q 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Packages inserted successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "4 sample packages have been created:" -ForegroundColor Green
        Write-Host "  1. Gói Cơ bản (Free, 30 days)" -ForegroundColor White
        Write-Host "  2. Gói Premium (Free, 90 days)" -ForegroundColor White
        Write-Host "  3. Gói Sinh viên Pro (Free, 180 days)" -ForegroundColor White
        Write-Host "  4. Gói Thăng tiến Sự nghiệp (Free, 365 days)" -ForegroundColor White
        Write-Host ""
        Write-Host "Refresh the packages page to see them!" -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] Failed to insert packages:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Failed to execute SQL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run manually:" -ForegroundColor Yellow
    Write-Host "  $psql -U $dbUser -d $dbName -f `"$sqlFile`"" -ForegroundColor White
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
