# Aura SDLC Database Setup

This directory contains all the necessary SQL scripts and automation tools to set up the complete Aura SDLC database from scratch.

## 📁 Files Overview

### SQL Scripts (Execute in Order)
1. **`01-create-database.sql`** - Creates the `aura_sdlc` database
2. **`02-create-users.sql`** - Creates `aura_user` with proper permissions  
3. **`03-create-tables.sql`** - Creates all SDLC tables (business_briefs, initiatives, features, epics, stories, test_cases, etc.)
4. **`04-create-vector-stores.sql`** - Sets up vector store tables for RAG functionality
5. **`05-create-procedures.sql`** - Creates stored procedures for common operations
6. **`06-initial-data.sql`** - Inserts sample data for testing and demonstration

### Automation Scripts
- **`setup.ps1`** - PowerShell script for automated setup (Recommended)
- **`setup.bat`** - Windows batch file for automated setup
- **`README.md`** - This documentation file

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

#### Using PowerShell (Recommended):
```powershell
# Navigate to the setup directory
cd database/setup

# Run the setup script
.\setup.ps1

# Or with custom parameters:
.\setup.ps1 -Host "localhost" -Port "3306" -RootUser "root"
```

#### Using Batch File:
```cmd
cd database\setup
setup.bat
```

### Option 2: Manual Setup

Execute each SQL file manually in order:

```bash
# Connect to MariaDB as root
mysql -u root -h 127.0.0.1 -P 3306 --skip-ssl -p

# Execute each file in order
source 01-create-database.sql
source 02-create-users.sql  
source 03-create-tables.sql
source 04-create-vector-stores.sql
source 05-create-procedures.sql
source 06-initial-data.sql
```

## 📋 Prerequisites

1. **MariaDB 11.8+** installed and running
2. **Root access** to MariaDB 
3. **PowerShell 5.1+** (for PowerShell script) or **Command Prompt** (for batch file)

### MariaDB Installation

If you don't have MariaDB installed:

```powershell
# Using Chocolatey
choco install mariadb

# Or download from: https://mariadb.org/download/
```

### Starting MariaDB

```powershell
# Start MariaDB server
Start-Process -FilePath "C:\Program Files\MariaDB 11.8\bin\mysqld.exe" -ArgumentList "--console" -WindowStyle Hidden
```

## 🔧 Configuration

After setup, add these environment variables to your `.env` file:

```env
# Aura Database Configuration
AURA_DB_HOST=127.0.0.1
AURA_DB_PORT=3306
AURA_DB_USER=aura_user
AURA_DB_PASSWORD=aura_password_123
AURA_DB_NAME=aura_sdlc
AURA_DB_MAX_POOL_SIZE=10
AURA_DB_SSL=false

# Optional: Embedding Configuration for RAG
# AURA_EMBEDDING_PROVIDER=openai
# AURA_EMBEDDING_API_KEY=your_api_key_here
# AURA_EMBEDDING_MODEL=text-embedding-3-small
```

## 🗄️ Database Schema

### Core SDLC Tables
- **`business_briefs`** - Root business requirements
- **`initiatives`** - High-level initiatives (linked to business briefs)  
- **`features`** - Features under initiatives
- **`epics`** - Epics under features
- **`stories`** - User stories under epics
- **`test_cases`** - Test cases for stories
- **`designs`** - Design artifacts for stories
- **`code_items`** - Code artifacts for stories

### RAG & Integration Tables
- **`documents`** - Uploaded documents for RAG processing
- **`vector_stores`** - Vector store configurations
- **`document_chunks`** - Document chunks with metadata
- **`safe_mappings`** - SAFe framework mappings

### Relationships
```
business_briefs (1) → (n) initiatives
initiatives (1) → (n) features  
features (1) → (n) epics
epics (1) → (n) stories
stories (1) → (n) test_cases
stories (1) → (n) designs
stories (1) → (n) code_items
```

## 🔍 Stored Procedures

The setup creates several stored procedures for common operations:

- **`GetWorkItemHierarchy(id, type)`** - Get complete hierarchy for a work item
- **`UpdateWorkItemProgress(id, type, status, percentage)`** - Update work item progress
- **`GetWorkItemsByStatus(status)`** - Get all work items by status across types
- **`GetTestCasesWithContext(story_id)`** - Get test cases with full context
- **`GetDashboardStats()`** - Get dashboard statistics
- **`SearchWorkItems(text)`** - Search work items by text

### Usage Examples:
```sql
-- Get hierarchy for a story
CALL GetWorkItemHierarchy('story-uuid', 'story');

-- Get all in-progress items  
CALL GetWorkItemsByStatus('in_progress');

-- Get dashboard stats
CALL GetDashboardStats();
```

## 🧪 Testing Setup

After setup, test your database:

1. **Start Aura application:**
   ```bash
   npm run dev
   ```

2. **Check database health:**
   ```
   http://localhost:3000/api/database/health
   ```

3. **Run database tests:**
   ```
   http://localhost:3000/api/database/test
   ```

## 📊 Sample Data

The setup includes sample data representing a complete SDLC flow:

- 1 Business Brief: "Customer Portal Enhancement"
- 1 Initiative: "Modernize Customer Dashboard" 
- 1 Feature: "Interactive Dashboard Widgets"
- 1 Epic: "Account Summary Widget"
- 1 Story: "Display Account Balance"
- 1 Test Case: "Verify Account Balance Display"
- 1 Design: "Account Balance Widget Mockup"
- 1 Code Item: "AccountBalanceWidget Component"
- 1 Document: "SAFe Framework Guide" (for RAG)
- 1 SAFe Mapping: Business Brief → Portfolio Epic

## 🛠️ Troubleshooting

### Common Issues:

**Connection Refused:**
```bash
# Make sure MariaDB is running
Get-Process mysqld
# If not running, start it:
Start-Process -FilePath "C:\Program Files\MariaDB 11.8\bin\mysqld.exe" -ArgumentList "--console"
```

**Access Denied:**
```bash
# Check if root password is correct
# Try connecting manually first:
mysql -u root -h 127.0.0.1 -P 3306 --skip-ssl -p
```

**File Not Found:**
```bash
# Make sure you're in the correct directory
cd database/setup
# Verify files exist:
ls *.sql
```

**Permission Errors:**
- Run PowerShell as Administrator
- Check MariaDB service permissions

### Reset Database:
```sql
-- To start over completely:
DROP DATABASE IF EXISTS aura_sdlc;
DROP USER IF EXISTS 'aura_user'@'localhost';
DROP USER IF EXISTS 'aura_user'@'127.0.0.1';  
DROP USER IF EXISTS 'aura_user'@'%';
-- Then run setup again
```

## 📝 Customization

### Modify Scripts:
- Edit SQL files to customize schema
- Update `setup.ps1`/`setup.bat` for different MariaDB paths
- Modify sample data in `06-initial-data.sql`

### Add New Tables:
1. Add CREATE TABLE statement to `03-create-tables.sql`
2. Add any related procedures to `05-create-procedures.sql`
3. Add sample data to `06-initial-data.sql`

## 🔒 Security Notes

- Default password is `aura_password_123` - **change this in production!**
- The `aura_user` has full privileges - restrict in production
- Consider using SSL connections for production environments
- Regularly backup your database

## 📞 Support

If you encounter issues:

1. Check the error messages in the console
2. Verify MariaDB is running and accessible
3. Ensure all SQL files are present
4. Try manual setup if automated setup fails
5. Check the Aura application logs for database connection issues

---

**Created for Aura SDLC Management System**
*Complete database setup for modern software development lifecycle management with embedded RAG capabilities.*
