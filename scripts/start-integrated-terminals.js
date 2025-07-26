#!/usr/bin/env node

/**
 * Multi-Terminal MCP Server Starter for Cursor IDE
 * 
 * This script starts each MCP server in its own terminal tab within Cursor IDE
 * for better debugging and isolation while maintaining integrated workflow.
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes
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

let terminalCount = 0;
const terminals = [];

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

// Create individual terminal scripts for each service
function createTerminalScript(serviceName, command, workingDir) {
  const scriptPath = path.join(__dirname, `temp-${serviceName.toLowerCase()}.js`);
  
  const scriptContent = `
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ${serviceName}...');
console.log('Working directory:', '${workingDir}');
console.log('Command:', '${command}');
console.log('=' + '='.repeat(50));

const proc = spawn('${command.split(' ')[0]}', ${JSON.stringify(command.split(' ').slice(1))}, {
  cwd: '${workingDir}',
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' }
});

proc.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

proc.on('exit', (code) => {
  console.log('\\n📊 ${serviceName} exited with code:', code);
});

// Keep process alive
process.stdin.resume();
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down ${serviceName}...');
  proc.kill('SIGTERM');
  process.exit(0);
});
`;

  fs.writeFileSync(scriptPath, scriptContent);
  return scriptPath;
}

// Function to start a service in its own terminal
async function startServiceInTerminal(serviceName, command, workingDir) {
  return new Promise((resolve) => {
    log('system', `Creating terminal for ${serviceName}...`, 'info');
    
    // Create temporary script for this service
    const scriptPath = createTerminalScript(serviceName, command, workingDir);
    
    // Start the script in its own process - Cursor will create a new terminal tab
    const terminal = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true,
      detached: false, // Keep attached so Cursor manages it
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    terminals.push({ name: serviceName, process: terminal, scriptPath });
    terminalCount++;
    
    terminal.on('error', (error) => {
      log('system', `Failed to start ${serviceName}: ${error.message}`, 'error');
    });
    
    log('system', `✅ ${serviceName} terminal created (${terminalCount}/3)`, 'success');
    
    // Small delay to let terminal initialize
    setTimeout(resolve, 2000);
  });
}

// Cleanup function
function cleanup() {
  log('system', '🧹 Cleaning up terminals and temp files...', 'warn');
  
  terminals.forEach(({ name, process, scriptPath }) => {
    try {
      if (process && !process.killed) {
        log('system', `Terminating ${name}...`, 'info');
        process.kill('SIGTERM');
      }
      
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
        log('system', `Cleaned up ${name} script`, 'info');
      }
    } catch (error) {
      log('system', `Error cleaning up ${name}: ${error.message}`, 'error');
    }
  });
}

// Setup graceful shutdown
function setupShutdown() {
  process.on('SIGINT', () => {
    log('system', '🛑 Received SIGINT, shutting down...', 'warn');
    cleanup();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('system', '🛑 Received SIGTERM, shutting down...', 'warn');
    cleanup();
    process.exit(0);
  });
  
  process.on('exit', () => {
    cleanup();
  });
}

// Main execution
async function main() {
  try {
    console.log(`${colors.bright}${colors.cyan}🚀 Starting Aura with Multi-Terminal MCP Servers${colors.reset}`);
    console.log('==================================================');
    console.log('📊 Each MCP server will open in its own terminal tab');
    console.log('==================================================');
    
    setupShutdown();
    
    const mcpDir = path.join(__dirname, '../mcp');
    const rootDir = path.join(__dirname, '..');
    
    log('system', '🚀 Creating terminal tabs for MCP servers...', 'info');
    
    // Start each MCP server in its own terminal
    await startServiceInTerminal(
      'Playwright MCP',
      'npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots',
      mcpDir
    );
    
    await startServiceInTerminal(
      'Jira MCP',
      'npx -y mcp-remote https://mcp.atlassian.com/v1/sse',
      mcpDir  
    );
    
    await startServiceInTerminal(
      'Bridge Server',
      'python mcp_server.py',
      mcpDir
    );
    
    // Start Aura dev server in main terminal
    log('aura', '🌐 Starting Aura Dev Server in main terminal...', 'info');
    
    const auraProc = spawn('npm', ['run', 'dev'], {
      cwd: rootDir,
      stdio: 'pipe',
      shell: true
    });
    
    auraProc.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        log('aura', message, 'info');
        if (message.includes('Ready in')) {
          log('aura', '✅ Aura server ready!', 'success');
        }
      }
    });
    
    auraProc.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        log('aura', message, 'error');
      }
    });
    
    terminals.push({ name: 'Aura Dev', process: auraProc, scriptPath: null });
    
    console.log('==================================================');
    log('system', '🎉 ALL SERVERS STARTED!', 'success');
    console.log('==================================================');
    console.log('📋 Services running:');
    console.log('  🎭 Playwright MCP: http://localhost:8931 (Terminal Tab)');
    console.log('  🔗 Jira MCP: Browser auth required (Terminal Tab)');
    console.log('  🐍 Bridge Server: http://localhost:8000 (Terminal Tab)');
    console.log('  🌐 Aura Dev: http://localhost:3000 (Main Terminal)');
    console.log('');
    console.log('💡 Each MCP server runs in its own Cursor terminal tab');
    console.log('🛑 Press Ctrl+C to stop all servers');
    console.log('📊 Switch between terminal tabs to see individual server logs');
    
    // Keep main process alive
    process.stdin.resume();
    
  } catch (error) {
    log('system', `Failed to start: ${error.message}`, 'error');
    cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 