# Aura Integrated MCP Startup System

## 🎯 Overview

The integrated startup system runs all MCP servers **inline within your IDE terminal**, making it easier to monitor, debug, and manage all services from one place.

## 🚀 Quick Start

### Start All Servers (Integrated Mode)
```bash
npm run start:integrated
```
or
```bash
npm run start:mcp
```

### Stop All Servers
```bash
npm run stop:integrated
```
or 
```bash
npm run stop:mcp
```

## 📋 What Gets Started

The integrated system starts these servers in sequence:

1. **🎭 Playwright MCP Server** (Port 8931)
   - Browser automation for test execution
   - Visible Chrome browser during tests
   - Screenshots saved to `mcp/screenshots/`

2. **🔗 Jira MCP Server** (OAuth callback on random port)
   - Connects to Atlassian Cloud via MCP
   - Opens browser for OAuth authentication
   - Wait for "Connected to remote server" message

3. **🐍 Aura MCP Bridge Server** (Port 8000)
   - Connects Aura to both MCP servers
   - Provides `/execute-test-case` and `/create-jira-issue` endpoints
   - Health checks at `/health` and `/health/jira`

4. **🌐 Aura Development Server** (Port 3000)
   - Next.js development server
   - Automatically opens browser to `/requirements`

## 🎨 Features

### Real-Time Logging
- **Color-coded logs** for each service
- **Timestamps** on all messages
- **Service prefixes** (PLAYWRIGHT, JIRA, BRIDGE, AURA)
- **Error highlighting** in red
- **Success messages** in green

### Health Monitoring
- **Port availability checks** before declaring success
- **HTTP health checks** for web services
- **Process monitoring** with automatic restart capabilities

### Clean Shutdown
- **Ctrl+C** to stop all servers gracefully
- **Signal handling** for proper cleanup
- **Port cleanup** to prevent conflicts

## 🔧 Advanced Usage

### Manual Server Control
You can also run the scripts directly:

```bash
# Start integrated system
node scripts/start-integrated.js

# Stop all servers
node scripts/stop-integrated.js
```

### Environment Setup
The system automatically checks for:
- `mcp/.env` or `mcp/env` file with API keys
- Required Node.js and Python dependencies
- Network port availability

### Debugging
If any server fails to start:
1. Check the **color-coded error messages** in the terminal
2. Verify **environment variables** are set correctly
3. Ensure **ports are not in use** by other applications
4. Check **firewall/antivirus** settings

## 🆚 Comparison: Integrated vs External Windows

| Feature | External Windows | Integrated Mode |
|---------|------------------|-----------------|
| **Visibility** | Multiple scattered windows | Single organized terminal |
| **Debugging** | Switch between windows | All logs in one place |
| **AI Assistance** | AI can't see external windows | AI can read all output |
| **Process Management** | Manual window closing | Automatic cleanup |
| **Resource Usage** | Higher (multiple terminals) | Lower (single process) |
| **Development Speed** | Slower debugging | Faster issue resolution |

## 🎉 Benefits for Development

1. **👁️ Full Visibility**: See all server output in real-time
2. **🤖 AI Integration**: I can read logs and help debug issues
3. **🔄 Easier Restarts**: Single command to restart everything
4. **📊 Better Monitoring**: Health checks and status updates
5. **🧹 Clean Environment**: Proper process cleanup on exit

## 🚨 Troubleshooting

### Common Issues

**❌ "Environment not configured"**
```bash
# Solution: Set up environment file
cd mcp
copy env.template .env
# Edit .env with your API keys
```

**❌ "Port already in use"**
```bash
# Solution: Stop existing servers
npm run stop:integrated
# Then restart
npm run start:integrated
```

**❌ "Python/Node not found"**
```bash
# Solution: Ensure both are in PATH
python --version
node --version
npm --version
```

### Getting Help
When reporting issues, copy the **entire terminal output** - the color-coded logs make it easy to identify problems and I can help debug them quickly!

## 🔮 Future Enhancements

- **Web Dashboard** for server monitoring
- **Log Persistence** and searching
- **Automatic Recovery** from failures
- **Performance Metrics** collection
- **Docker Integration** for containerized deployment 