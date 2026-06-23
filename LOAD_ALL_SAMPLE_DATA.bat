@echo off
SET PGPASSWORD=Aa1234
echo ========================================
echo Loading Sample Data for All Services
echo ========================================
echo.
echo Each microservice has its own database:
echo - user_service_db
echo - learning_service_db
echo - content_service_db
echo - job_service_db
echo.

echo [1/4] User Service → user_service_db...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d user_service_db -f "backend\microservices\user-service\src\main\resources\sample-data.sql"
if errorlevel 1 (
    echo ERROR: Failed to load user service data!
    echo Make sure database 'user_service_db' exists!
)

echo.
echo [2/4] Learning Service → learning_service_db...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d learning_service_db -f "backend\microservices\learning-service\src\main\resources\sample-data.sql"
if errorlevel 1 (
    echo ERROR: Failed to load learning service data!
    echo Make sure database 'learning_service_db' exists!
)

echo.
echo [3/4] Content Service → content_service_db...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d content_service_db -f "backend\microservices\content-service\src\main\resources\sample-data.sql"
if errorlevel 1 (
    echo ERROR: Failed to load content service data!
    echo Make sure database 'content_service_db' exists!
)

echo.
echo [4/4] Job Service → job_service_db...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d job_service_db -f "backend\microservices\job-service\src\main\resources\sample-data.sql"
if errorlevel 1 (
    echo ERROR: Failed to load job service data!
    echo Make sure database 'job_service_db' exists!
)

echo.
echo ========================================
echo DONE! All sample data loaded!
echo ========================================
echo.
echo Sample data created:
echo - 15 Users (10 students + 5 recruiters)
echo - 3 Packages
echo - 3 CV Templates
echo - 5 Companies
echo - 4 Jobs
echo - 3 Articles
echo.
echo Admin pages: http://localhost:5173/admin/
echo.
pause

