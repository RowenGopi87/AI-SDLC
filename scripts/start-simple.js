#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

// Colors for logging
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Store process references for cleanup
const processes = [];

// Enhanced logging function
function log(service, message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let color = colors.cyan;
  
  switch (type) {
    case 'error': color = colors.red; break;
    case 'success': color = colors.green; break;
    case 'warn': color = colors.yellow; break;
    case 'info': color = colors.blue; break;
  }
  
  const serviceTag = `[${service.toUpperCase()}]`.padEnd(12);
  console.log(`[${timestamp}] ${color}${serviceTag}${colors.reset} ${message}`);
}

// Function to create terminal in Cursor IDE
function createIDETerminal(name, command, cwd) {
  return new Promise((resolve) => {
    log('system', `Opening ${name} in new Cursor terminal...`, 'info');
    
    // Use VS Code/Cursor command to create new terminal with specific command
    const terminalCommand = `code --new-window --command "workbench.action.terminal.new" --command "workbench.action.terminal.rename" --title "${name}"`;
    
    // Alternative approach: use the integrated terminal API
    // For Cursor/VS Code, we can use the built-in terminal creation
    exec(`code --command "workbench.action.terminal.new"`, { cwd }, (error) => {
      if (error) {
        log('system', `Could not create IDE terminal, falling back to direct spawn`, 'warn');
        // Fallback to direct process spawn if IDE integration fails
        const proc = spawn('cmd', ['/c', command], {
          cwd,
          stdio: 'inherit',
          shell: true
        });
        processes.push(proc);
      }
      resolve();
    });
    
    // Give time for terminal to open
    setTimeout(resolve, 1000);
  });
}

// Alternative approach: Create processes that show up as separate terminal tabs
async function startPlaywrightMCP() {
  log('playwright', '🎭 Starting Playwright MCP Server...', 'info');
  
  return new Promise((resolve) => {
    // Start the process - this will appear as a new terminal in Cursor
    const proc = spawn('npx', ['@playwright/mcp@latest', '--port', '8931', '--browser', 'chrome', '--output-dir', 'screenshots'], {
      cwd: path.join(__dirname, '../mcp'),
      stdio: 'inherit', // This allows the output to be visible in the terminal
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' } // Preserve colors
    });
    
    processes.push(proc);
    
    proc.on('error', (error) => {
      log('playwright', `Error: ${error.message}`, 'error');
    });
    
    log('playwright', 'Started Playwright MCP Server on port 8931', 'success');
    setTimeout(resolve, 3000);
  });
}

async function startJiraMCP() {
  log('jira', '🔗 Starting Jira MCP Server...', 'info');
  
  return new Promise((resolve) => {
    // Start the process - this will appear as a new terminal in Cursor
    const proc = spawn('npx', ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'], {
      cwd: path.join(__dirname, '../mcp'),
      stdio: 'inherit', // This allows the output to be visible in the terminal
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' } // Preserve colors
    });
    
    processes.push(proc);
    
    proc.on('error', (error) => {
      log('jira', `Error: ${error.message}`, 'error');
    });
    
    log('jira', 'Started Jira MCP Server - browser will open for auth', 'success');
    setTimeout(resolve, 3000);
  });
}

async function startBridgeServer() {
  log('bridge', '🐍 Starting Bridge Server...', 'info');
  
  return new Promise((resolve) => {
    // Start the process - this will appear as a new terminal in Cursor
    const proc = spawn('python', ['mcp_server.py'], {
      cwd: path.join(__dirname, '../mcp'),
      stdio: 'inherit', // This allows the output to be visible in the terminal
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' } // Preserve colors
    });
    
    processes.push(proc);
    
    proc.on('error', (error) => {
      log('bridge', `Error: ${error.message}`, 'error');
    });
    
    log('bridge', 'Started Bridge Server on port 8000', 'success');
    setTimeout(resolve, 3000);
  });
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
  
  return new Promise(resolve => setTimeout(resolve, 3000));
}

// Graceful shutdown handler
function setupGracefulShutdown() {
  const shutdown = () => {
    log('system', '🛑 Shutting down all servers...', 'warn');
    
    processes.forEach((proc, index) => {
      if (proc && !proc.killed) {
        log('system', `Terminating process ${index + 1}...`, 'info');
        proc.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      processes.forEach((proc) => {
        if (proc && !proc.killed) {
          proc.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);
}

// Main execution
async function main() {
  try {
    console.log(`${colors.bright}${colors.cyan}🚀 Starting Aura with Integrated MCP Servers${colors.reset}`);
    console.log('==================================================');
    
    setupGracefulShutdown();
    
    log('system', '🚀 Starting all servers...', 'info');
    
    // Start all MCP servers in parallel - each will open in its own terminal tab
    await Promise.all([
      startPlaywrightMCP(),
      startJiraMCP(), 
      startBridgeServer()
    ]);
    
    // Start Aura dev server in the main terminal
    await startAura();
    
    console.log('==================================================');
    log('system', '🎉 ALL SERVERS STARTED!', 'success');
    console.log('==================================================');
    console.log('📋 Servers running:');
    console.log('  🎭 Playwright MCP: http://localhost:8931');
    console.log('  🔗 Jira MCP: Authentication required');
    console.log('  🐍 Bridge Server: http://localhost:8000');
    console.log('  🌐 Aura Dev: http://localhost:3000');
    console.log('🛑 Press Ctrl+C to stop all servers');
    console.log('📊 Each MCP server runs in its own Cursor terminal tab');
    
    // Keep the main process alive
    process.stdin.resume();
    
  } catch (error) {
    log('system', `Failed to start servers: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 