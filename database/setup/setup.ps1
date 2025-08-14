# =============================================
# Aura SDLC Database Complete Setup Script
# PowerShell Version
# =============================================

param(
    [string]$MariaDBPath = "C:\Program Files\MariaDB 11.8\bin\mysql.exe",
    [string]$Host = "127.0.0.1",
    [string]$Port = "3306",
    [string]$RootUser = "root",
    [string]$RootPassword = "",
    [switch]$SkipUserInput
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  AURA SDLC DATABASE SETUP WIZARD" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MariaDB exists
if (!(Test-Path $MariaDBPath)) {
    Write-Host "❌ MariaDB not found at: $MariaDBPath" -ForegroundColor Red
    Write-Host "Please install MariaDB or update the path." -ForegroundColor Red
    exit 1
}

Write-Host "✅ MariaDB found at: $MariaDBPath" -ForegroundColor Green
Write-Host ""

# Get setup directory
$SetupDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$SqlFiles = @(
    "01-create-database.sql",
    "02-create-users.sql",
    "03-create-tables.sql",
    "04-create-vector-stores.sql",
    "05-create-procedures.sql",
    "06-initial-data.sql"
)

# Verify all SQL files exist
$AllFilesExist = $true
foreach ($file in $SqlFiles) {
    $fullPath = Join-Path $SetupDir $file
    if (!(Test-Path $fullPath)) {
        Write-Host "❌ Missing SQL file: $file" -ForegroundColor Red
        $AllFilesExist = $false
    }
}

if (!$AllFilesExist) {
    Write-Host "Please ensure all SQL setup files are in the setup directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ All SQL setup files found" -ForegroundColor Green
Write-Host ""

# Get root password if not provided
if ([string]::IsNullOrEmpty($RootPassword) -and !$SkipUserInput) {
    $SecurePassword = Read-Host -Prompt "Enter MariaDB root password (or press Enter if no password)" -AsSecureString
    $RootPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))
}

# Build connection arguments
$ConnectionArgs = @("-u", $RootUser, "-h", $Host, "-P", $Port, "--skip-ssl")
if (![string]::IsNullOrEmpty($RootPassword)) {
    $ConnectionArgs += @("-p$RootPassword")
}

Write-Host "🔄 Starting database setup process..." -ForegroundColor Yellow
Write-Host ""

$OverallSuccess = $true
$Results = @{}

# Execute each SQL file
foreach ($file in $SqlFiles) {
    $fullPath = Join-Path $SetupDir $file
    Write-Host "📝 Executing: $file" -ForegroundColor Cyan
    
    try {
        $result = & $MariaDBPath @ConnectionArgs -e "source $fullPath" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Success" -ForegroundColor Green
            $Results[$file] = "Success"
        } else {
            Write-Host "   ❌ Failed" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
            $Results[$file] = "Failed: $result"
            $OverallSuccess = $false
        }
    } catch {
        Write-Host "   ❌ Exception: $($_.Exception.Message)" -ForegroundColor Red
        $Results[$file] = "Exception: $($_.Exception.Message)"
        $OverallSuccess = $false
    }
    
    Write-Host ""
}

# Summary
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "           SETUP SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

foreach ($file in $SqlFiles) {
    $status = $Results[$file]
    if ($status -eq "Success") {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - $status" -ForegroundColor Red
    }
}

Write-Host ""
if ($OverallSuccess) {
    Write-Host "🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Add these environment variables to your .env file:" -ForegroundColor White
    Write-Host "   AURA_DB_HOST=$Host" -ForegroundColor Gray
    Write-Host "   AURA_DB_PORT=$Port" -ForegroundColor Gray
    Write-Host "   AURA_DB_USER=aura_user" -ForegroundColor Gray
    Write-Host "   AURA_DB_PASSWORD=aura_password_123" -ForegroundColor Gray
    Write-Host "   AURA_DB_NAME=aura_sdlc" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start your Aura application:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test the database connection:" -ForegroundColor White
    Write-Host "   http://localhost:3000/api/database/health" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ DATABASE SETUP FAILED" -ForegroundColor Red
    Write-Host "Please check the errors above and try again." -ForegroundColor Red
    exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
