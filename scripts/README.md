# Utility Scripts

This folder contains utility scripts for managing the Aura project and MCP integration.

## 🛠️ Available Scripts

### 🔧 **MCP Management**

#### `setup-mcp.bat`
- **Purpose**: Complete MCP setup and configuration
- **Usage**: `.\scripts\setup-mcp.bat`
- **Description**: Sets up the MCP environment, installs dependencies, and configures the system

#### `restart_mcp_with_fix.bat`
- **Purpose**: Restart MCP servers with browser visibility fixes
- **Usage**: `.\scripts\restart_mcp_with_fix.bat`
- **Description**: Stops existing servers and restarts with official Playwright package

#### `restart-mcp-server.bat`
- **Purpose**: Quick restart of MCP server
- **Usage**: `.\scripts\restart-mcp-server.bat`
- **Description**: Restarts the MCP server without full system restart

### 🌐 **Browser & Process Management**

#### `clear-browser-processes.bat`
- **Purpose**: Clear all browser processes
- **Usage**: `.\scripts\clear-browser-processes.bat`
- **Description**: Kills all Chrome, Edge, and Node.js processes

#### `stop-all-servers.bat`
- **Purpose**: Stop all running servers
- **Usage**: `.\scripts\stop-all-servers.bat`
- **Description**: Stops all Node.js and Python servers

### 🔍 **Diagnostics & Testing**

#### `diagnose-mcp-connection.bat`
- **Purpose**: Diagnose MCP connection issues
- **Usage**: `.\scripts\diagnose-mcp-connection.bat`
- **Description**: Tests MCP connectivity and provides diagnostic information

#### `test-llm-connection.py`
- **Purpose**: Test LLM API connectivity
- **Usage**: `python .\scripts\test-llm-connection.py`
- **Description**: Tests connections to OpenAI, Anthropic, and Google APIs

### 🔒 **SSL & Security**

#### `fix-ssl-issues.bat`
- **Purpose**: Fix SSL certificate issues
- **Usage**: `.\scripts\fix-ssl-issues.bat`
- **Description**: Resolves SSL certificate problems for API connections

### 🌐 **Development Utilities**

#### `simple_server.py`
- **Purpose**: Simple HTTP server for testing
- **Usage**: `python .\scripts\simple_server.py`
- **Description**: Lightweight HTTP server for local development and testing

## 📋 Usage Instructions

### For New Users
1. Run `setup-mcp.bat` first to configure the environment
2. Use `test-llm-connection.py` to verify API connectivity
3. Use `diagnose-mcp-connection.bat` if you encounter connection issues

### For Troubleshooting
1. **Browser Issues**: Use `clear-browser-processes.bat`
2. **Server Issues**: Use `stop-all-servers.bat` then restart
3. **SSL Issues**: Run `fix-ssl-issues.bat`
4. **MCP Issues**: Use `diagnose-mcp-connection.bat`

### For Development
1. Use `simple_server.py` for local testing
2. Use `restart_mcp_with_fix.bat` for clean MCP restart
3. Use diagnostic scripts to troubleshoot issues

## ⚠️ Important Notes

- **Run from Project Root**: Execute scripts from the main project directory
- **Administrator Rights**: Some scripts may require administrator privileges
- **Dependencies**: Ensure all project dependencies are installed before running scripts
- **Environment**: Make sure `.env` files are properly configured

## 🔄 Common Workflows

### Full System Reset
```batch
.\scripts\stop-all-servers.bat
.\scripts\clear-browser-processes.bat
.\scripts\restart_mcp_with_fix.bat
```

### Troubleshooting Workflow
```batch
.\scripts\diagnose-mcp-connection.bat
python .\scripts\test-llm-connection.py
.\scripts\fix-ssl-issues.bat
```

### Development Setup
```batch
.\scripts\setup-mcp.bat
python .\scripts\test-llm-connection.py
.\scripts\restart_mcp_with_fix.bat
``` 