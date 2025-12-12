#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

// Redirect all output to a log file
const logFile = '/workspaces/eclip/ECLIP_AUDIT_OUTPUT.txt';
const originalLog = console.log;
const originalError = console.error;

const stream = fs.createWriteStream(logFile);

console.log = function(...args) {
  const msg = args.join(' ');
  stream.write(msg + '\n');
  originalLog(msg);
};

console.error = function(...args) {
  const msg = args.join(' ');
  stream.write('ERROR: ' + msg + '\n');
  originalError(msg);
};

// Now run the actual audit
require('./scripts/auto-audit.js');
