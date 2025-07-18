@echo off
echo ========================================
echo  Fixing SSL Certificate Issues
echo ========================================
echo.

echo 🔧 Installing certifi package...
pip install certifi

echo.
echo 🔧 Running SSL fix script...
cd mcp
python fix_ssl_certificates.py

echo.
echo 🔧 Setting up SSL environment variables...
for /f "tokens=*" %%i in ('python -c "import certifi; print(certifi.where())"') do set SSL_CERT_FILE=%%i
for /f "tokens=*" %%i in ('python -c "import certifi; print(certifi.where())"') do set REQUESTS_CA_BUNDLE=%%i

echo SSL_CERT_FILE=%SSL_CERT_FILE%
echo REQUESTS_CA_BUNDLE=%REQUESTS_CA_BUNDLE%

echo.
echo 🔧 Testing OpenAI connection...
python -c "import openai; print('✅ OpenAI library imported successfully')"

echo.
echo ========================================
echo  SSL Fix Complete!
echo ========================================
echo.
echo ✅ SSL certificate issues should be resolved
echo ✅ Try running the test case again
echo.
echo If you still have issues:
echo 1. Check your internet connection
echo 2. Verify you're not behind a corporate firewall
echo 3. Contact your IT administrator
echo.
pause 