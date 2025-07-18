# SSL Certificate Troubleshooting Guide

## 🚨 The Problem
You're seeing this error when trying to execute test cases:
```
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
```

This happens when the system can't verify the SSL certificate for the OpenAI API.

## 🔧 Quick Fixes

### 1. Run the SSL Fix Script
```bash
fix-ssl-issues.bat
```
This will:
- Install the `certifi` package
- Configure SSL certificate paths
- Test the OpenAI connection

### 2. Test Your Connection
```bash
python test-openai-connection.py
```
This will diagnose exactly what's wrong with your OpenAI API connection.

## 🔍 Common Causes & Solutions

### Corporate Network/Firewall
**Problem:** Your company's firewall or proxy is blocking SSL connections.

**Solutions:**
1. Contact your IT administrator
2. Ask them to whitelist `api.openai.com`
3. Request SSL certificate exceptions for OpenAI

### Outdated Certificates
**Problem:** Your system's SSL certificates are outdated.

**Solutions:**
1. Update Windows (Windows Update)
2. Run `fix-ssl-issues.bat`
3. Reinstall Python with latest certificates

### Proxy Issues
**Problem:** Network proxy is interfering with SSL connections.

**Solutions:**
1. Configure proxy settings in your environment
2. Add these to your `mcp/.env` file:
   ```
   HTTP_PROXY=http://your-proxy:port
   HTTPS_PROXY=https://your-proxy:port
   ```

### Antivirus/Security Software
**Problem:** Antivirus software is blocking SSL connections.

**Solutions:**
1. Temporarily disable antivirus
2. Add Python/OpenAI to antivirus exceptions
3. Configure SSL scanning exceptions

## 🛠️ Manual SSL Fix

If the automatic fix doesn't work, try this manual approach:

### 1. Install certifi
```bash
pip install certifi
```

### 2. Set Environment Variables
```bash
# Windows Command Prompt
set SSL_CERT_FILE=C:\path\to\certificates.pem
set REQUESTS_CA_BUNDLE=C:\path\to\certificates.pem

# PowerShell
$env:SSL_CERT_FILE = "C:\path\to\certificates.pem"
$env:REQUESTS_CA_BUNDLE = "C:\path\to\certificates.pem"
```

### 3. Find Certificate Path
```python
import certifi
print(certifi.where())
```

## 🧪 Testing Steps

### 1. Test Python SSL
```python
import ssl
import socket

context = ssl.create_default_context()
with socket.create_connection(('api.openai.com', 443)) as sock:
    with context.wrap_socket(sock, server_hostname='api.openai.com') as ssock:
        print("✅ SSL connection successful")
```

### 2. Test OpenAI API
```python
from openai import OpenAI
client = OpenAI(api_key="your-api-key")
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello"}],
    max_tokens=5
)
print("✅ OpenAI API working")
```

## 🚫 Last Resort: Disable SSL Verification

⚠️ **WARNING:** Only use this for testing, never in production!

Add to your `mcp/.env` file:
```
PYTHONHTTPSVERIFY=0
```

Or modify the Python code:
```python
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
```

## 📋 Debugging Checklist

- [ ] Run `fix-ssl-issues.bat`
- [ ] Run `python test-openai-connection.py`
- [ ] Check internet connection
- [ ] Verify OpenAI API key is valid
- [ ] Check for corporate firewall/proxy
- [ ] Update Windows certificates
- [ ] Contact IT administrator if needed
- [ ] Test with different network (mobile hotspot)

## 🆘 Getting Help

If none of these solutions work:

1. **Check Network:** Try using a mobile hotspot
2. **Contact IT:** If you're on a corporate network
3. **OpenAI Support:** Check OpenAI's status page
4. **Alternative:** Use Google or Anthropic APIs instead

## 📝 Prevention

To avoid SSL issues in the future:
- Keep Windows updated
- Regularly update Python packages
- Use corporate-approved certificate stores
- Configure proxy settings properly

---

**Still having issues?** The SSL certificate error is resolved in the latest version of the MCP server. Make sure you're running the updated version! 