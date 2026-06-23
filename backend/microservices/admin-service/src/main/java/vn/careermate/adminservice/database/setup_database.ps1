# PowerShell script to setup admin_service_db database
$ErrorActionPreference = "Stop"

# PostgreSQL path (adjust if needed)
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "Aa1234"

Write-Host "`n=== Setting up admin_service_db ===" -ForegroundColor Cyan

# Check if database exists
$dbExists = & $psqlPath -U postgres -t -c "SELECT 1 FROM pg_database WHERE datname='admin_service_db';" 2>&1

if ($dbExists.Trim() -eq "1") {
    Write-Host "Database admin_service_db already exists" -ForegroundColor Yellow
} else {
    Write-Host "Creating database admin_service_db..." -ForegroundColor Yellow
    & $psqlPath -U postgres -c "CREATE DATABASE admin_service_db;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

# Run schema.sql
$schemaPath = Join-Path $PSScriptRoot "schema.sql"
if (Test-Path $schemaPath) {
    Write-Host "Applying schema..." -ForegroundColor Yellow
    & $psqlPath -U postgres -d admin_service_db -f $schemaPath 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema applied successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Schema application had warnings (may already exist)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Schema file not found: $schemaPath" -ForegroundColor Yellow
}

Write-Host "`n✅ Database setup complete!" -ForegroundColor Green
