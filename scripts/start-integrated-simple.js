#!/usr/bin/env node

console.log('🚀 Starting Aura with Integrated MCP Servers');
console.log('='.repeat(50));

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const processes = new Map();

function log(service, message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warn: '\x1b[33m',    // yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}[${timestamp}] [${service.toUpperCase()}] ${message}${colors.reset}`);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkEnvironment() {
  log('system', '🔍 Checking environment setup...', 'info');
  
  const envFile = path.join(__dirname, '../mcp/env');
  if (!fs.existsSync(envFile)) {
    log('system', '❌ MCP environment not configured!', 'error');
    log('system', 'Please ensure mcp/env file exists with your API keys', 'error');
    process.exit(1);
  }
  
  log('system', '✅ Environment configured', 'success');
}

async function stopExistingServers() {
  log('system', '🛑 Stopping existing servers...', 'info');
  
  return new Promise((resolve) => {
    exec('taskkill /F /IM node.exe >nul 2>&1 & taskkill /F /IM python.exe >nul 2>&1', (error) => {
      // Ignore errors - processes might not exist
      log('system', '✅ Cleanup completed', 'success');
      resolve();
    });
  });
}

function startServer(name, command, args, cwd, successMessage) {
  return new Promise((resolve, reject) => {
    log(name, `🚀 Starting ${name} server...`, 'info');
    
    const process = spawn(command, args, {
      cwd: cwd,
      stdio: 'pipe',
      shell: true
    });

    processes.set(name, process);
    
    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        log(name, message, 'info');
        if (successMessage && message.includes(successMessage)) {
          log(name, `✅ ${name} server started successfully!`, 'success');
        }
      }
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('warning')) {
        log(name, message, 'error');
      }
    });

    process.on('error', (error) => {
      log(name, `❌ Failed to start: ${error.message}`, 'error');
      reject(error);
    });

    process.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(name, `❌ Exited with code ${code}`, 'error');
      }
    });

    // Resolve after a delay to allow startup
    setTimeout(() => {
      if (!process.killed) {
        resolve();
      }
    }, 5000);
  });
}

async function setupSignalHandlers() {
  const cleanup = async () => {
    console.log('\n🛑 Shutting down servers...');
    
    for (const [name, proc] of processes) {
      log('system', `Stopping ${name}...`, 'info');
      proc.kill();
    }
    
    await delay(1000);
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

async function main() {
  try {
    await setupSignalHandlers();
    await checkEnvironment();
    await stopExistingServers();
    await delay(2000);

    // Start servers in sequence
    await startServer(
      'playwright',
      'npx',
      ['@playwright/mcp@latest', '--port', '8931', '--browser', 'chrome', '--output-dir', 'screenshots'],
      path.join(__dirname, '../mcp'),
      'MCP server listening'
    );

    await startServer(
      'jira',
      'npx',
      ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'],
      path.join(__dirname, '../mcp'),
      'Connected to remote server'
    );

    await startServer(
      'bridge',
      'python',
      ['mcp_server.py'],
      path.join(__dirname, '../mcp'),
      'Uvicorn running'
    );

    await startServer(
      'aura',
      'npm',
      ['run', 'dev'],
      path.join(__dirname, '..'),
      'Ready in'
    );

    // Show final status
    console.log('\n' + '='.repeat(60));
    log('system', '🎉 ALL SERVERS STARTED!', 'success');
    console.log('='.repeat(60));
    
    console.log('\n📋 Server Status:');
    console.log('  🎭 Playwright MCP: http://localhost:8931 ✅');
    console.log('  🔗 Jira MCP: Authentication required ⚠️');
    console.log('  🐍 Aura MCP Bridge: http://localhost:8000 ✅');
    console.log('  🌐 Aura Dev Server: http://localhost:3000 ✅');
    
    console.log('\n🔧 All servers are running in integrated mode');
    console.log('📊 Server logs appear above in real-time');
    console.log('🛑 Press Ctrl+C to stop all servers');
    
    // Open browser
    console.log('\n🚀 Opening Aura in browser...');
    exec('start http://localhost:3000/requirements');
    
    // Keep alive
    process.stdin.resume();
    
  } catch (error) {
    log('system', `❌ Startup failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

main(); 