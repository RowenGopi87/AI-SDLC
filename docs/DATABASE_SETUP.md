# 🚀 Aura Database Setup Guide

## ❌ **Current Issue: Missing Database Credentials**

You're seeing this error because you haven't configured your MariaDB database credentials yet. Let's fix this!

```json
{"success":false,"error":"Database configuration invalid: AURA_DB_PASSWORD environment variable is required","message":"Database test failed"}
```

## ✅ **Quick Fix - 3 Simple Steps**

### **Step 1: Set Up MariaDB**

**Option A: Install MariaDB Locally**
```bash
# Windows (using Chocolatey)
choco install mariadb

# macOS (using Homebrew)
brew install mariadb

# Ubuntu/Debian
sudo apt-get install mariadb-server
```

**Option B: Use Docker (Recommended)**
```bash
# Pull and run MariaDB in Docker
docker run --name aura-mariadb \
  -e MYSQL_ROOT_PASSWORD=aura_password_123 \
  -e MYSQL_DATABASE=aura_sdlc \
  -e MYSQL_USER=aura_user \
  -e MYSQL_PASSWORD=aura_password_123 \
  -p 3306:3306 \
  -d mariadb:latest
```

### **Step 2: Add Environment Variables**

Add these lines to your `.env` file (create it if it doesn't exist):

```bash
# ================================
# AURA DATABASE CONFIGURATION
# ================================
AURA_DB_HOST=localhost
AURA_DB_PORT=3306
AURA_DB_USER=aura_user
AURA_DB_PASSWORD=aura_password_123
AURA_DB_NAME=aura_sdlc

# ================================
# OPTIONAL: RAG FUNCTIONALITY
# ================================
# Uncomment these lines if you want RAG/AI assistant features
# AURA_EMBEDDING_PROVIDER=openai
# AURA_EMBEDDING_API_KEY=sk-your-openai-api-key-here
```

### **Step 3: Restart Your App**

```bash
# Stop your app (Ctrl+C) then restart
npm run dev
```

## ✅ **Test Your Setup**

Once you've added the environment variables:

1. **Health Check**: Visit `http://localhost:3000/api/database/health`
   - ✅ Should show: `{"healthy": true, "services": {"database": {"connected": true}}}`

2. **Full Test**: Visit `http://localhost:3000/api/database/test`
   - ✅ Should show: `{"success": true, "message": "All database tests passed successfully"}`

3. **Visual Check**: Look for the green database status in your app

## 🔧 **Docker Quick Start (Easiest)**

If you have Docker installed, run this one command:

```bash
docker run --name aura-mariadb -e MYSQL_ROOT_PASSWORD=aura_password_123 -e MYSQL_DATABASE=aura_sdlc -e MYSQL_USER=aura_user -e MYSQL_PASSWORD=aura_password_123 -p 3306:3306 -d mariadb:latest
```

Then add to your `.env`:
```bash
AURA_DB_HOST=localhost
AURA_DB_PORT=3306
AURA_DB_USER=aura_user
AURA_DB_PASSWORD=aura_password_123
AURA_DB_NAME=aura_sdlc
```

## 🐛 **Still Having Issues?**

### **Error: "Connection failed"**
- Make sure MariaDB is running: `docker ps` (if using Docker)
- Check credentials match exactly

### **Error: "Access denied"**
- Double-check username/password in `.env`
- Make sure user has CREATE database permissions

### **Error: "Can't connect to server"**
- Ensure MariaDB is listening on port 3306
- Check if another service is using port 3306

## 📋 **What Happens After Setup**

Once configured, Aura will automatically:
- ✅ Connect to your MariaDB database
- ✅ Create the `aura_sdlc` database if it doesn't exist
- ✅ Create all required tables (business_briefs, initiatives, features, etc.)
- ✅ Set up proper relationships and indexes
- ✅ Initialize the RAG system (if OpenAI key provided)

**You'll see green status indicators in your app when everything is working!**

