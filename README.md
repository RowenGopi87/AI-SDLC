# Aura - AI-Powered Requirements Management System

A comprehensive requirements management system with AI-powered generation and automated test execution capabilities, now featuring **Jira Cloud integration via MCP**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Google AI API key (for LLM features)
- Jira Cloud account (for Jira integration)

### Setup

1. **Clone and install dependencies:**
   ```bash
git clone <repository>
cd Aura
   npm install
   ```

2. **Set up MCP servers:**
   ```bash
cd mcp
# Run the comprehensive startup script
./start_all_mcp_servers.bat
```

This will start:
- 🎭 **Playwright MCP Server** (Port 8931) - For automated testing
- 🔗 **Jira MCP Server** (Browser auth) - For Jira integration  
- 🐍 **Aura MCP Bridge** (Port 8000) - Connects everything together

3. **Configure environment:**
   - Update `.env` file with your API keys and Jira settings
   - Get your Jira Cloud ID from: `https://your-domain.atlassian.net/_edge/tenant_info`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## ✨ New Feature: Jira Cloud Integration

### 🎯 Create Jira Issues from Initiatives

1. **Navigate to Requirements page** (`/requirements`)
2. **Find any Initiative work item** 
3. **Click the blue Jira icon** (🔗) next to the "Generate Features" button
4. **Initiative automatically created as Jira Epic** with:
   - Formatted description with business value
   - Proper priority mapping
   - Acceptance criteria
   - Source traceability tags

### 🔧 Configuration

Update your `mcp/.env` file:
```bash
# Jira MCP Configuration  
JIRA_MCP_URL=http://localhost:8932
JIRA_CLOUD_ID=your-cloud-id-here
JIRA_DEFAULT_PROJECT_KEY=AURA

# LLM Configuration (required)
GOOGLE_API_KEY=your_google_api_key_here
```

### 🔍 How It Works

1. **Button Click** → Initiative data sent to API endpoint
2. **API Processing** → Formats initiative for Jira (title, description, acceptance criteria)
3. **MCP Bridge** → Connects to Atlassian Remote MCP Server  
4. **Jira Creation** → Epic created with proper mapping and labels
5. **Success Notification** → Shows Jira issue link and key

## 🏗️ Architecture

```
Aura Frontend (Next.js)
    ↓
API Routes (/api/create-jira-issue)
    ↓  
Python MCP Bridge Server (Port 8000)
    ↓
Atlassian Remote MCP Server
    ↓
Jira Cloud API
```

## 🎭 Existing Features

### Test Automation
- **Browser automation** via Playwright MCP
- **Visual test execution** with screenshots
- **AI-powered test case generation**

### Requirements Management
- **Hierarchical work items** (Initiative → Feature → Epic → Story)
- **AI-powered decomposition** 
- **Traceability matrix**
- **Acceptance criteria management**

### Workflow Support
- **Business brief → Requirements → Work items → Test cases**
- **Multiple LLM providers** (OpenAI, Anthropic, Google)
- **Mock data for development**

## 🔧 MCP Server Management

### Individual Server Control
```bash
# Start only Playwright MCP
./start_mcp_servers.bat

# Start only Jira MCP  
./start_jira_mcp_server.bat

# Start all servers
./start_all_mcp_servers.bat
```

### Troubleshooting

**Jira Authentication Issues:**
1. Ensure you're logged into Jira Cloud
2. Check your Cloud ID is correct
3. Verify project permissions

**MCP Connection Issues:**
1. Check server logs in command windows
2. Verify ports 8931, 8932, 8000 are available
3. Restart servers if authentication expires

## 📋 API Endpoints

### Jira Integration
- `POST /api/create-jira-issue` - Create Jira issue from initiative

### Test Execution  
- `POST /execute-test-case` - Execute test via Playwright
- `GET /health` - Server health check
- `GET /tools` - Available MCP tools

## 🔗 Important URLs

- **Development Server**: http://localhost:3000
- **Requirements/Work Items**: http://localhost:3000/requirements
- **MCP Bridge Server**: http://localhost:8000
- **Jira Cloud ID**: `https://your-domain.atlassian.net/_edge/tenant_info`

## 📚 Usage Guide

1. **Create Business Briefs** → Use Cases page
2. **Generate Requirements** → AI-powered from business briefs  
3. **Create Work Items** → Initiative → Feature → Epic → Story hierarchy
4. **Generate Test Cases** → AI-powered from work items
5. **Execute Tests** → Automated browser testing
6. **Create in Jira** → One-click initiative → Jira Epic creation

## 🔄 Development Workflow

1. Start MCP servers: `./mcp/start_all_mcp_servers.bat`
2. Start dev server: `npm run dev`  
3. Authenticate with Jira (browser popup)
4. Create initiatives in Requirements page
5. Click Jira icon to create Epic in Jira Cloud
6. Monitor server logs for debugging

## 🚨 Security Notes

- MCP servers use OAuth authentication
- API keys stored in environment variables
- CORS configured for localhost development
- Production deployment requires HTTPS

---

**🎉 You now have a complete AI-powered requirements management system with seamless Jira Cloud integration!**
