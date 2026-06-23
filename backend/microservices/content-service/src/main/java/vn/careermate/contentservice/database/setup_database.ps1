# PowerShell script to setup Job-Service database
# This script creates the database and runs schema.sql

$ErrorActionPreference = "Stop"

# PostgreSQL paths
$PSQL_PATH = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$PG_DUMP_PATH = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

# Database configuration
$DB_USER = "postgres"
$DB_PASSWORD = "Aa1234"
$OLD_DB = "careermate_db"
$NEW_DB = "job_service_db"
$SCHEMA = "jobservice"

# Script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$CREATE_DB_SCRIPT = Join-Path $SCRIPT_DIR "create_database.sql"
$SCHEMA_SCRIPT = Join-Path $SCRIPT_DIR "schema.sql"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Job-Service Database Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
if (-not (Test-Path $PSQL_PATH)) {
    Write-Host "ERROR: PostgreSQL not found at $PSQL_PATH" -ForegroundColor Red
    Write-Host "Please update PSQL_PATH in this script" -ForegroundColor Yellow
    exit 1
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $DB_PASSWORD

try {
    # Step 1: Create database
    Write-Host "Step 1: Creating database $NEW_DB..." -ForegroundColor Yellow
    & $PSQL_PATH -U $DB_USER -d postgres -c "CREATE DATABASE $NEW_DB;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database $NEW_DB created successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Database might already exist, continuing..." -ForegroundColor Yellow
    }
    
    # Step 2: Create schema and tables
    Write-Host "Step 2: Creating schema and tables..." -ForegroundColor Yellow
    & $PSQL_PATH -U $DB_USER -d $NEW_DB -f $SCHEMA_SCRIPT
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Schema and tables created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Error creating schema" -ForegroundColor Red
        exit 1
    }
    
    # Step 3: Ask about migration
    Write-Host ""
    Write-Host "Step 3: Data Migration" -ForegroundColor Yellow
    $migrate = Read-Host "Do you want to migrate data from $OLD_DB.$SCHEMA? (y/n)"
    
    if ($migrate -eq "y" -or $migrate -eq "Y") {
        Write-Host "Migrating data from $OLD_DB.$SCHEMA to $NEW_DB.$SCHEMA..." -ForegroundColor Yellow
        
        # Export data
        $EXPORT_FILE = Join-Path $SCRIPT_DIR "job_service_data.sql"
        Write-Host "Exporting data to $EXPORT_FILE..." -ForegroundColor Yellow
        & $PG_DUMP_PATH -U $DB_USER -d $OLD_DB -t "$SCHEMA.jobs" -t "$SCHEMA.applications" -t "$SCHEMA.saved_jobs" -t "$SCHEMA.job_skills" -t "$SCHEMA.application_history" --data-only --column-inserts --encoding=UTF8 -f $EXPORT_FILE
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Data exported successfully" -ForegroundColor Green
            
            # Import data
            Write-Host "Importing data to $NEW_DB..." -ForegroundColor Yellow
            & $PSQL_PATH -U $DB_USER -d $NEW_DB -f $EXPORT_FILE
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Data imported successfully" -ForegroundColor Green
            } else {
                Write-Host "✗ Error importing data" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ Error exporting data" -ForegroundColor Red
        }
    } else {
        Write-Host "Skipping data migration. Database will be empty." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Setup completed!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Database: $NEW_DB" -ForegroundColor Cyan
    Write-Host "Schema: $SCHEMA" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update application.yml (already done)" -ForegroundColor White
    Write-Host "2. Restart Job-Service" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear password
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
