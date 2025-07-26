#!/usr/bin/env node

console.log('🚀 Starting Aura with Integrated MCP Servers');
console.log('='.repeat(50));

const { spawn, exec } = require('child_process');
const path = require('path');

function log(service, message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${timestamp}] [${service.toUpperCase()}] ${message}${colors.reset}`);
}

const processes = [];

// Signal handlers for cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  processes.forEach(proc => proc.kill());
  process.exit(0);
});

async function startPlaywrightMCP() {
  log('playwright', '🎭 Starting Playwright MCP Server...', 'info');
  
  // Start in separate CMD window for better visibility
  const proc = spawn('cmd', ['/c', 'start "Playwright MCP Server" cmd /k "npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"'], {
    cwd: path.join(__dirname, '../mcp'),
    stdio: 'pipe',
    shell: true
  });
  
  processes.push(proc);
  
  // Log the startup
  log('playwright', 'Started in separate CMD window on port 8931', 'success');
  
  return new Promise(resolve => setTimeout(resolve, 3000));
}

async function startJiraMCP() {
  log('jira', '🔗 Starting Jira MCP Server...', 'info');
  log('jira', 'Browser will open for authentication', 'info');
  
  // Start in separate CMD window for better visibility
  const proc = spawn('cmd', ['/c', 'start "Jira MCP Server" cmd /k "npx -y mcp-remote https://mcp.atlassian.com/v1/sse"'], {
    cwd: path.join(__dirname, '../mcp'),
    stdio: 'pipe',
    shell: true
  });
  
  processes.push(proc);
  
  // Log the startup
  log('jira', 'Started in separate CMD window', 'success');
  log('jira', 'Complete authentication in the browser window', 'info');
  
  return new Promise(resolve => setTimeout(resolve, 3000));
}

async function startBridgeServer() {
  log('bridge', '🐍 Starting Bridge Server...', 'info');
  
  // Start in separate CMD window for better visibility and debugging
  const proc = spawn('cmd', ['/c', 'start "Aura MCP Bridge" cmd /k "python mcp_server.py"'], {
    cwd: path.join(__dirname, '../mcp'),
    stdio: 'pipe',
    shell: true
  });
  
  processes.push(proc);
  
  // Log the startup
  log('bridge', 'Started in separate CMD window on port 8000', 'success');
  
  return new Promise(resolve => setTimeout(resolve, 3000));
}

async function startAura() {
  log('aura', '🌐 Starting Aura Dev Server...', 'info');
  
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    shell: true
  });
  
  processes.push(proc);
  
  proc.stdout.on('data', (data) => {
    const message = data.toString().trim();
    log('aura', message, 'info');
    if (message.includes('Ready in')) {
      log('aura', '✅ Aura server ready!', 'success');
    }
  });
  
  proc.stderr.on('data', (data) => {
    log('aura', data.toString().trim(), 'error');
  });
  
  return new Promise(resolve => setTimeout(resolve, 8000));
}

async function main() {
  try {
    log('system', '🚀 Starting all servers...', 'info');
    
    await startPlaywrightMCP();
    await startJiraMCP();
    await startBridgeServer();
    await startAura();
    
    console.log('\n' + '='.repeat(50));
    log('system', '🎉 ALL SERVERS STARTED!', 'success');
    console.log('='.repeat(50));
    
    console.log('\n📋 Servers running:');
    console.log('  🎭 Playwright MCP: http://localhost:8931');
    console.log('  🔗 Jira MCP: Authentication required');
    console.log('  🐍 Bridge Server: http://localhost:8000');
    console.log('  🌐 Aura Dev: http://localhost:3000');
    
    console.log('\n🛑 Press Ctrl+C to stop all servers');
    console.log('📊 All logs appear above in real-time');
    
    // Open browser
    exec('start http://localhost:3000/requirements');
    
    // Keep alive
    process.stdin.resume();
    
  } catch (error) {
    log('system', `❌ Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

main(); 