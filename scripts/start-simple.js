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

async function startPlaywright() {
  log('playwright', '🎭 Starting Playwright MCP Server...', 'info');
  
  const proc = spawn('npx', ['@playwright/mcp@latest', '--port', '8931', '--browser', 'chrome'], {
    cwd: path.join(__dirname, '../mcp'),
    stdio: 'pipe',
    shell: true
  });
  
  processes.push(proc);
  
  proc.stdout.on('data', (data) => {
    log('playwright', data.toString().trim(), 'info');
  });
  
  proc.stderr.on('data', (data) => {
    log('playwright', data.toString().trim(), 'error');
  });
  
  return new Promise(resolve => setTimeout(resolve, 5000));
}

async function startJira() {
  log('jira', '🔗 Starting Jira MCP Server...', 'info');
  log('jira', 'Browser will open for authentication', 'warn');
  
  const proc = spawn('npx', ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'], {
    cwd: path.join(__dirname, '../mcp'),
    stdio: 'pipe',
    shell: true
  });
  
  processes.push(proc);
  
  proc.stdout.on('data', (data) => {
    const message = data.toString().trim();
    log('jira', message, 'info');
    if (message.includes('Connected to remote server')) {
      log('jira', '✅ Jira connected successfully!', 'success');
    }
  });
  
  proc.stderr.on('data', (data) => {
    log('jira', data.toString().trim(), 'error');
  });
  
  return new Promise(resolve => setTimeout(resolve, 5000));
}

async function startBridge() {
  log('bridge', '🐍 Starting Bridge Server...', 'info');
  
  const proc = spawn('python', ['mcp_server.py'], {
    cwd: path.join(__dirname, '../mcp'),
    stdio: 'pipe',
    shell: true
  });
  
  processes.push(proc);
  
  proc.stdout.on('data', (data) => {
    const message = data.toString().trim();
    log('bridge', message, 'info');
    if (message.includes('Uvicorn running')) {
      log('bridge', '✅ Bridge server ready!', 'success');
    }
  });
  
  proc.stderr.on('data', (data) => {
    log('bridge', data.toString().trim(), 'error');
  });
  
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
    
    await startPlaywright();
    await startJira();
    await startBridge();
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