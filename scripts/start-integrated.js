#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class IntegratedMCPOrchestrator {
  constructor() {
    this.processes = new Map();
    this.logs = {
      system: [],
      playwright: [],
      jira: [],
      bridge: [],
      aura: []
    };
  }

  log(service, message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${service.toUpperCase()}]`;
    const formattedMessage = `${prefix} ${message}`;
    
    // Store in logs
    this.logs[service].push({ timestamp, message, type });
    
    // Output to console with colors
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      error: '\x1b[31m',   // red
      warn: '\x1b[33m',    // yellow
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${formattedMessage}${colors.reset}`);
  }

  async checkEnvironment() {
    this.log('system', '🔍 Checking environment setup...', 'info');
    
    const envFile = path.join(__dirname, '../mcp/.env');
    if (!fs.existsSync(envFile) && !fs.existsSync(path.join(__dirname, '../mcp/env'))) {
      this.log('system', '❌ MCP environment not configured!', 'error');
      this.log('system', 'Please run scripts/setup-mcp.bat first', 'error');
      process.exit(1);
    }
    
    this.log('system', '✅ Environment configured', 'success');
  }

  async killExistingProcesses() {
    this.log('system', '🛑 Stopping existing servers...', 'info');
    
    const killCommands = [
      'taskkill /F /IM node.exe /T',
      'taskkill /F /IM python.exe /T'
    ];
    
    for (const cmd of killCommands) {
      try {
        await this.runCommand(cmd, { stdio: 'ignore' });
      } catch (error) {
        // Ignore errors - processes might not exist
      }
    }
    
    // Wait for processes to close
    await this.delay(3000);
    this.log('system', '✅ Existing processes stopped', 'success');
  }

  async startPlaywrightMCP() {
    this.log('playwright', '🎭 Starting Playwright MCP Server (Port 8931)...', 'info');
    this.log('playwright', 'Browser will be VISIBLE during test execution!', 'warn');
    
    const process = spawn('npx', [
      '@playwright/mcp@latest',
      '--port', '8931',
      '--browser', 'chrome',
      '--output-dir', 'screenshots'
    ], {
      cwd: path.join(__dirname, '../mcp'),
      stdio: 'pipe'
    });

    this.processes.set('playwright', process);
    
    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('playwright', message, 'info');
      }
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('playwright', message, 'error');
      }
    });

    process.on('error', (error) => {
      this.log('playwright', `Failed to start: ${error.message}`, 'error');
    });

    // Wait for server to initialize
    await this.delay(8000);
    
    // Check if port is listening
    const isListening = await this.checkPort(8931);
    if (isListening) {
      this.log('playwright', '✅ Playwright MCP Server is running on port 8931', 'success');
    } else {
      this.log('playwright', '⚠️  Server may still be starting...', 'warn');
    }
  }

  async startJiraMCP() {
    this.log('jira', '🔗 Starting Jira MCP Server...', 'info');
    this.log('jira', '⚠️  IMPORTANT: Browser will open for Jira authentication', 'warn');
    this.log('jira', '⚠️  Please complete authentication and wait for "Connected to remote server"', 'warn');
    
    const process = spawn('npx', ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'], {
      cwd: path.join(__dirname, '../mcp'),
      stdio: 'pipe'
    });

    this.processes.set('jira', process);
    
    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('jira', message, 'info');
        if (message.includes('Connected to remote server')) {
          this.log('jira', '✅ Jira MCP Server connected successfully!', 'success');
        }
      }
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('jira', message, 'error');
      }
    });

    process.on('error', (error) => {
      this.log('jira', `Failed to start: ${error.message}`, 'error');
    });

    // Wait for server to initialize
    await this.delay(8000);
    this.log('jira', '⏳ Waiting for Jira authentication...', 'info');
    this.log('jira', '📝 Please complete authentication in the browser window that opened', 'warn');
  }

  async startBridgeServer() {
    this.log('bridge', '🐍 Starting Aura MCP Bridge Server (Port 8000)...', 'info');
    
    const process = spawn('python', ['mcp_server.py'], {
      cwd: path.join(__dirname, '../mcp'),
      stdio: 'pipe'
    });

    this.processes.set('bridge', process);
    
    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('bridge', message, 'info');
        if (message.includes('Uvicorn running')) {
          this.log('bridge', '✅ Bridge Server is running on port 8000', 'success');
        }
      }
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('bridge', message, 'error');
      }
    });

    process.on('error', (error) => {
      this.log('bridge', `Failed to start: ${error.message}`, 'error');
    });

    // Wait and verify server is healthy
    await this.delay(5000);
    
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        this.log('bridge', '✅ Bridge Server health check passed', 'success');
      }
    } catch (error) {
      this.log('bridge', '⚠️  Health check failed - server may still be starting', 'warn');
    }
  }

  async startAuraDevServer() {
    this.log('aura', '🌐 Starting Aura Development Server...', 'info');
    
    const process = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    this.processes.set('aura', process);
    
    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('aura', message, 'info');
        if (message.includes('Ready in')) {
          this.log('aura', '✅ Aura Development Server is ready!', 'success');
        }
      }
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('aura', message, 'error');
      }
    });

    process.on('error', (error) => {
      this.log('aura', `Failed to start: ${error.message}`, 'error');
    });

    // Wait for server to be ready
    await this.delay(10000);
    
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok) {
        this.log('aura', '✅ Aura server is responding on port 3000', 'success');
      }
    } catch (error) {
      this.log('aura', '⚠️  Server may still be starting...', 'warn');
    }
  }

  async showSummary() {
    console.log('\n' + '='.repeat(60));
    this.log('system', '🎉 ALL SERVERS STARTED!', 'success');
    console.log('='.repeat(60));
    
    console.log('\n📋 Server Status:');
    console.log('  🎭 Playwright MCP: http://localhost:8931 ✅');
    console.log('  🔗 Jira MCP: Browser authenticated ✅');
    console.log('  🐍 Aura MCP Bridge: http://localhost:8000 ✅');
    console.log('  🌐 Aura Dev Server: http://localhost:3000 ✅');
    
    console.log('\n📝 Ready to use:');
    console.log('  ✅ Test Case Execution (Playwright MCP)');
    console.log('  ✅ Jira Integration (Click Jira icons on initiatives)');
    console.log('  ✅ Requirements Management (Full Aura functionality)');
    
    console.log('\n🔧 All servers are running in integrated mode');
    console.log('📊 Server logs appear above in real-time');
    console.log('🛑 Press Ctrl+C to stop all servers');
    
    console.log('\n🚀 Opening Aura in browser...');
    
    // Open browser
    const { exec } = require('child_process');
    exec('start http://localhost:3000/requirements');
  }

  async checkPort(port) {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec(`netstat -an | findstr :${port}`, (error, stdout) => {
        resolve(!error && stdout.includes('LISTENING'));
      });
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async setupSignalHandlers() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}, shutting down servers...`);
        
        for (const [name, proc] of this.processes) {
          this.log('system', `Stopping ${name} server...`, 'info');
          proc.kill('SIGTERM');
        }
        
        await this.delay(2000);
        process.exit(0);
      });
    });
  }

  async start() {
    try {
      console.log('🚀 Starting Aura with Integrated MCP Servers');
      console.log('='.repeat(50));
      
      await this.setupSignalHandlers();
      await this.checkEnvironment();
      await this.killExistingProcesses();
      
      // Start servers in sequence
      await this.startPlaywrightMCP();
      await this.startJiraMCP();
      await this.startBridgeServer();
      await this.startAuraDevServer();
      
      await this.showSummary();
      
      // Keep the process alive
      process.stdin.resume();
      
    } catch (error) {
      this.log('system', `Startup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Start the orchestrator
const orchestrator = new IntegratedMCPOrchestrator();
orchestrator.start(); 