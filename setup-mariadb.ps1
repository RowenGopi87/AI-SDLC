# AURA MariaDB Setup Script
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "     AURA MARIADB SETUP WIZARD" -ForegroundColor Cyan  
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MariaDB is installed
$mariadbPath = "C:\Program Files\MariaDB 11.8\bin\mysql.exe"
if (!(Test-Path $mariadbPath)) {
    Write-Host "❌ MariaDB not found at expected location." -ForegroundColor Red
    Write-Host "Please install MariaDB first or check the installation path." -ForegroundColor Red
    exit 1
}

Write-Host "✅ MariaDB found!" -ForegroundColor Green
Write-Host ""

# Try to start MariaDB server
Write-Host "🔄 Starting MariaDB server..." -ForegroundColor Yellow
try {
    $process = Start-Process -FilePath "C:\Program Files\MariaDB 11.8\bin\mysqld.exe" -ArgumentList "--console" -WindowStyle Hidden -PassThru
    Write-Host "✅ MariaDB server started (Process ID: $($process.Id))" -ForegroundColor Green
    Start-Sleep -Seconds 3
} catch {
    Write-Host "⚠️ Could not start MariaDB server automatically." -ForegroundColor Yellow
    Write-Host "It might already be running or need manual startup." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Now let's try to connect and set up your database..." -ForegroundColor Yellow
Write-Host ""

# Try different connection methods
$connectionMethods = @(
    @{ args = "-u root --skip-ssl"; description = "root user without SSL" },
    @{ args = "-u root -p --skip-ssl"; description = "root user with password prompt" },
    @{ args = "-u root --skip-ssl -h localhost"; description = "root user explicit localhost" }
)

$connected = $false
foreach ($method in $connectionMethods) {
    Write-Host "Trying connection: $($method.description)" -ForegroundColor Cyan
    
    try {
        $sqlScript = @"
CREATE DATABASE IF NOT EXISTS aura_sdlc;
CREATE USER IF NOT EXISTS 'aura_user'@'localhost' IDENTIFIED BY 'aura_password_123';
CREATE USER IF NOT EXISTS 'aura_user'@'%' IDENTIFIED BY 'aura_password_123';
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'localhost';
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'%';
FLUSH PRIVILEGES;
SELECT 'Setup completed successfully!' as Result;
"@
        
        $result = & $mariadbPath $method.args.Split(' ') -e $sqlScript 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
            Write-Host $result -ForegroundColor White
            $connected = $true
            break
        }
    } catch {
        Write-Host "❌ Connection failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if (-not $connected) {
    Write-Host ""
    Write-Host "⚠️ Automatic setup failed. Please try manual setup:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Open Command Prompt or PowerShell as Administrator" -ForegroundColor White
    Write-Host "2. Run: `"C:\Program Files\MariaDB 11.8\bin\mysql.exe`" -u root --skip-ssl" -ForegroundColor White
    Write-Host "3. If it asks for password, try: (empty), root, admin, or aura_password_123" -ForegroundColor White
    Write-Host "4. Then run the commands in setup-aura-database.sql" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "📋 Add these to your .env file:" -ForegroundColor Cyan
Write-Host ""
Write-Host "AURA_DB_HOST=localhost" -ForegroundColor White
Write-Host "AURA_DB_PORT=3306" -ForegroundColor White  
Write-Host "AURA_DB_USER=aura_user" -ForegroundColor White
Write-Host "AURA_DB_PASSWORD=aura_password_123" -ForegroundColor White
Write-Host "AURA_DB_NAME=aura_sdlc" -ForegroundColor White
Write-Host ""
Write-Host "Then restart your Aura app with: npm run dev" -ForegroundColor Green
Write-Host ""
