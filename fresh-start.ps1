Write-Host "Cleaning up Next.js cache and processes..." -ForegroundColor Yellow

# Kill any running Node.js processes
Write-Host "Killing existing Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Killed existing Node.js processes" -ForegroundColor Green
} else {
    Write-Host "✓ No Node.js processes to kill" -ForegroundColor Green
}

# Remove Next.js build cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Removed Next.js cache" -ForegroundColor Green
} else {
    Write-Host "✓ No Next.js cache to remove" -ForegroundColor Green
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Cleared npm cache" -ForegroundColor Green

Write-Host "Starting fresh development server..." -ForegroundColor Yellow
npm run dev 