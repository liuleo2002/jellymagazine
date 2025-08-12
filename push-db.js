#!/usr/bin/env node
const { spawn } = require('child_process');

const child = spawn('npm', ['run', 'db:push'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

// Send "+" to select create table option
setTimeout(() => {
  child.stdin.write('+\n');
}, 2000);

child.on('close', (code) => {
  console.log(`Database migration completed with code ${code}`);
  process.exit(code);
});