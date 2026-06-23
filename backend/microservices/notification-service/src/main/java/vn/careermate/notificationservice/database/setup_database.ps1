# Setup Database for Notification-Service
# Run this script to create database and schema

$ErrorActionPreference = "Stop"

# Database configuration
$DB_NAME = "notification_service_db"
$DB_USER = "postgres"
$DB_PASSWORD = "Aa1234"
$SCHEMA_NAME = "notificationservice"

# PostgreSQL paths (adjust if needed)
$PSQL_PATH = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $PSQL_PATH)) {
    $PSQL_PATH = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
}
if (-not (Test-Path $PSQL_PATH)) {
    $PSQL_PATH = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
}
if (-not (Test-Path $PSQL_PATH)) {
    Write-Host "❌ PostgreSQL psql.exe not found. Please install PostgreSQL or update PSQL_PATH in this script." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Notification-Service Database Setup ===" -ForegroundColor Cyan
Write-Host "Database: $DB_NAME" -ForegroundColor White
Write-Host "Schema: $SCHEMA_NAME" -ForegroundColor White
Write-Host ""

# Set password
$env:PGPASSWORD = $DB_PASSWORD

# Step 1: Create database
Write-Host "[1/3] Creating database..." -ForegroundColor Yellow
$createDbQuery = "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';"
$dbExists = & $PSQL_PATH -U $DB_USER -d postgres -t -c $createDbQuery 2>&1

if ($dbExists -match "1") {
    Write-Host "✅ Database $DB_NAME already exists" -ForegroundColor Green
} else {
    $result = & $PSQL_PATH -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database $DB_NAME created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database: $result" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Create schema
Write-Host "`n[2/3] Creating schema..." -ForegroundColor Yellow
$createSchemaQuery = "CREATE SCHEMA IF NOT EXISTS $SCHEMA_NAME; GRANT ALL ON SCHEMA $SCHEMA_NAME TO $DB_USER;"
$result = & $PSQL_PATH -U $DB_USER -d $DB_NAME -c $createSchemaQuery 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema $SCHEMA_NAME created successfully!" -ForegroundColor Green
} else {
    if ($result -match "already exists") {
        Write-Host "✅ Schema $SCHEMA_NAME already exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create schema: $result" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Create tables
Write-Host "`n[3/3] Creating tables..." -ForegroundColor Yellow
$schemaFile = Join-Path $PSScriptRoot "schema.sql"
if (Test-Path $schemaFile) {
    $result = Get-Content $schemaFile | & $PSQL_PATH -U $DB_USER -d $DB_NAME 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tables created successfully!" -ForegroundColor Green
    } else {
        if ($result -match "already exists") {
            Write-Host "✅ Tables already exist" -ForegroundColor Green
        } else {
            Write-Host "⚠ Some warnings (tables may already exist):" -ForegroundColor Yellow
            $result | Select-String -Pattern "ERROR|WARNING" | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        }
    }
} else {
    Write-Host "⚠ Schema file not found: $schemaFile" -ForegroundColor Yellow
}

# Verify
Write-Host "`n=== Verification ===" -ForegroundColor Cyan
$tableCount = & $PSQL_PATH -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$SCHEMA_NAME';" 2>&1
$tableCount = $tableCount.Trim()
Write-Host "Tables in schema: $tableCount" -ForegroundColor White

Write-Host "`n✅ Database setup completed!" -ForegroundColor Green
Write-Host "`nDatabase: $DB_NAME" -ForegroundColor White
Write-Host "Schema: $SCHEMA_NAME" -ForegroundColor White
Write-Host "Tables: $tableCount" -ForegroundColor White
