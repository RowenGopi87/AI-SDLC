@echo off
echo =========================================
echo     AURA MARIADB SETUP SCRIPT
echo =========================================
echo.
echo This script will help you set up MariaDB for Aura
echo.
echo STEP 1: Starting MariaDB (if not running)
echo ----------------------------------------
start /b "MariaDB" "C:\Program Files\MariaDB 11.8\bin\mysqld.exe" --console
timeout /t 3 >nul

echo.
echo STEP 2: Connect to MariaDB and create database
echo ----------------------------------------
echo.
echo Please run these commands one by one:
echo.
echo 1. Connect to MariaDB:
echo    "C:\Program Files\MariaDB 11.8\bin\mysql.exe" -u root --skip-ssl
echo.
echo 2. If it asks for password, try: (empty password, just press Enter)
echo    OR try common passwords: root, admin, or aura_password_123
echo.
echo 3. Once connected, run these SQL commands:
echo.
echo    CREATE DATABASE IF NOT EXISTS aura_sdlc;
echo    CREATE USER IF NOT EXISTS 'aura_user'@'localhost' IDENTIFIED BY 'aura_password_123';
echo    CREATE USER IF NOT EXISTS 'aura_user'@'%%' IDENTIFIED BY 'aura_password_123';
echo    GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'localhost';
echo    GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'%%';
echo    FLUSH PRIVILEGES;
echo    EXIT;
echo.
echo 4. Your .env file should contain:
echo    AURA_DB_HOST=localhost
echo    AURA_DB_PORT=3306
echo    AURA_DB_USER=aura_user
echo    AURA_DB_PASSWORD=aura_password_123
echo    AURA_DB_NAME=aura_sdlc
echo.
echo =========================================
pause

