#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🛑 Stopping all Aura MCP servers...');
console.log('='.repeat(40));

const killCommands = [
  'tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr "node.exe"',
  'tasklist /FI "IMAGENAME eq python.exe" /FO CSV | findstr "python.exe"'
];

async function killProcesses() {
  const commands = [
    'taskkill /F /IM node.exe /T',
    'taskkill /F /IM python.exe /T'
  ];
  
  for (const cmd of commands) {
    try {
      await runCommand(cmd);
      console.log(`✅ Stopped processes: ${cmd.split(' ')[3]}`);
    } catch (error) {
      console.log(`ℹ️  No ${cmd.split(' ')[3]} processes found`);
    }
  }
}

async function freeUpPorts() {
  const ports = [8931, 8932, 8000, 3000];
  
  for (const port of ports) {
    try {
      await runCommand(`for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}"') do taskkill /F /PID %a`);
      console.log(`✅ Freed port ${port}`);
    } catch (error) {
      console.log(`ℹ️  Port ${port} already free`);
    }
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function main() {
  try {
    await killProcesses();
    await freeUpPorts();
    
    console.log('\n✅ All servers stopped successfully!');
    console.log('🚀 You can now run "npm run start:integrated" to restart');
    
  } catch (error) {
    console.error('❌ Error stopping servers:', error.message);
    process.exit(1);
  }
}

main(); 