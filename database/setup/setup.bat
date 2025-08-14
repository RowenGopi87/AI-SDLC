@echo off
REM =============================================
REM Aura SDLC Database Complete Setup Script
REM Batch File Version
REM =============================================

echo =========================================
echo   AURA SDLC DATABASE SETUP WIZARD
echo =========================================
echo.

set MARIADB_PATH="C:\Program Files\MariaDB 11.8\bin\mysql.exe"
set HOST=127.0.0.1
set PORT=3306
set ROOT_USER=root

REM Check if MariaDB exists
if not exist %MARIADB_PATH% (
    echo ❌ MariaDB not found at: %MARIADB_PATH%
    echo Please install MariaDB or update the path in this script.
    pause
    exit /b 1
)

echo ✅ MariaDB found at: %MARIADB_PATH%
echo.

REM Get root password
set /p ROOT_PASSWORD=Enter MariaDB root password (or press Enter if no password): 

echo.
echo 🔄 Starting database setup process...
echo.

REM Execute SQL files in order
echo 📝 Step 1: Creating database...
%MARIADB_PATH% -u %ROOT_USER% -h %HOST% -P %PORT% --skip-ssl -p%ROOT_PASSWORD% -e "source 01-create-database.sql"
if errorlevel 1 goto :error

echo 📝 Step 2: Creating users...
%MARIADB_PATH% -u %ROOT_USER% -h %HOST% -P %PORT% --skip-ssl -p%ROOT_PASSWORD% -e "source 02-create-users.sql"
if errorlevel 1 goto :error

echo 📝 Step 3: Creating tables...
%MARIADB_PATH% -u %ROOT_USER% -h %HOST% -P %PORT% --skip-ssl -p%ROOT_PASSWORD% -e "source 03-create-tables.sql"
if errorlevel 1 goto :error

echo 📝 Step 4: Setting up vector stores...
%MARIADB_PATH% -u %ROOT_USER% -h %HOST% -P %PORT% --skip-ssl -p%ROOT_PASSWORD% -e "source 04-create-vector-stores.sql"
if errorlevel 1 goto :error

echo 📝 Step 5: Creating stored procedures...
%MARIADB_PATH% -u %ROOT_USER% -h %HOST% -P %PORT% --skip-ssl -p%ROOT_PASSWORD% -e "source 05-create-procedures.sql"
if errorlevel 1 goto :error

echo 📝 Step 6: Inserting sample data...
%MARIADB_PATH% -u %ROOT_USER% -h %HOST% -P %PORT% --skip-ssl -p%ROOT_PASSWORD% -e "source 06-initial-data.sql"
if errorlevel 1 goto :error

echo.
echo =========================================
echo 🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!
echo =========================================
echo.
echo 📋 Next Steps:
echo 1. Add these to your .env file:
echo    AURA_DB_HOST=%HOST%
echo    AURA_DB_PORT=%PORT%
echo    AURA_DB_USER=aura_user
echo    AURA_DB_PASSWORD=aura_password_123
echo    AURA_DB_NAME=aura_sdlc
echo.
echo 2. Start your Aura application:
echo    npm run dev
echo.
echo 3. Test: http://localhost:3000/api/database/health
echo.
pause
exit /b 0

:error
echo.
echo ❌ DATABASE SETUP FAILED
echo Please check the error messages above.
echo.
pause
exit /b 1
