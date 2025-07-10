@echo off
echo Cleaning up Next.js cache and processes...

REM Kill any running Node.js processes
taskkill /F /IM node.exe >nul 2>&1

REM Remove Next.js build cache
if exist .next rmdir /s /q .next

REM Clear npm cache
npm cache clean --force

echo Starting fresh development server...
npm run dev 