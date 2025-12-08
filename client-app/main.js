const { app, BrowserWindow, ipcMain, protocol, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const axios = require('axios');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');

// Auto-detect API URL based on environment
const API_BASE_URL = process.env.API_URL || 
  (process.env.NODE_ENV === 'production' || app.isPackaged
    ? 'https://www.eclip.pro'
    : 'http://localhost:9002');
const PLATFORM_NAME = 'eclip.pro';

let mainWindow;
let tray;
let heartbeatInterval;
let processMonitorInterval;
let gameProcessId = null;
let matchData = null;

// Protocol handler for eclip:// URLs
app.setAsDefaultProtocolClient('eclip');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    show: false // Don't show until ready
  });

  mainWindow.loadFile('index.html');
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  // Create system tray
  createTray();

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close - minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopHeartbeat();
    stopProcessMonitoring();
  });
}

// Handle protocol on Windows
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance with a protocol URL
  if (mainWindow) {
    mainWindow.show();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  
  // Check if it's a protocol URL
  const url = commandLine.find((arg) => arg.startsWith('eclip://'));
  if (url) {
    handleProtocolUrl(url);
  }
});

// macOS protocol handler
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
});

function handleProtocolUrl(url) {
  console.log('Protocol URL received:', url);
  // Handle different protocol commands
  // e.g., eclip://connect, eclip://launch
  if (url.includes('launch') || url.includes('connect')) {
    if (mainWindow) {
      mainWindow.webContents.send('start-connection');
    }
  }
}

// System Tray Integration
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.ico');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Status',
      enabled: false,
      click: () => {}
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  tray.setToolTip(`${PLATFORM_NAME} Anti-Cheat`);
}

// Process Monitoring System (Like ESEA/FACEIT)
function startProcessMonitoring(userId, token, matchId = null) {
  stopProcessMonitoring();
  
  // Monitor every 5 seconds during active play
  processMonitorInterval = setInterval(async () => {
    try {
      const suspiciousProcesses = await detectSuspiciousProcesses();
      const matchInfo = await getMatchInfo(userId, matchId);
      
      if (suspiciousProcesses.length > 0) {
        await reportSuspiciousActivity(userId, token, suspiciousProcesses, matchInfo);
        if (mainWindow) {
          mainWindow.webContents.send('suspicious-detected', {
            processes: suspiciousProcesses,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Process monitoring error:', err);
    }
  }, 5000);
}

function stopProcessMonitoring() {
  if (processMonitorInterval) {
    clearInterval(processMonitorInterval);
    processMonitorInterval = null;
  }
}

// Detect Cheat Tools and Suspicious Applications
async function detectSuspiciousProcesses() {
  return new Promise((resolve) => {
    // Common cheat tool signatures (ESEA/FACEIT style detection)
    const suspiciousNames = [
      'cheat', 'hack', 'aimbot', 'wallhack', 'esp', 'triggerbot', 'speedhack',
      'dnspy', 'ilspy', 'frida', 'gdb', 'windbg', 'ollydbg', 'x64dbg',
      'processhacker', 'cheatenginetable', 'autohotkey', 'ahk', 'uconsole',
      'reshade', 'injecter', 'trainer', 'maphack', 'godmode', 'proxy',
      'vpn', 'tor', 'proxifier', 'cloak', 'antidetect', 'emulator',
      'virtualmachine', 'sandbox', 'wireshark', 'fiddler', 'burp'
    ];

    const detected = [];

    exec('tasklist /v /fo list', (error, stdout, stderr) => {
      if (error) {
        resolve([]);
        return;
      }

      const processes = stdout.split('\n');
      processes.forEach((line) => {
        const processName = line.toLowerCase();
        suspiciousNames.forEach((suspicious) => {
          if (processName.includes(suspicious)) {
            detected.push({
              name: processName.trim(),
              type: suspicious,
              timestamp: new Date().toISOString(),
              severity: 'high'
            });
          }
        });
      });

      resolve(detected);
    });
  });
}

// Get Current Match Info
async function getMatchInfo(userId, matchId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/matches/${matchId}`,
      { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
    );
    return response.data;
  } catch (err) {
    return { userId, matchId, timestamp: new Date().toISOString() };
  }
}

// Report Suspicious Activity to Admins/Mods
async function reportSuspiciousActivity(userId, token, processes, matchInfo) {
  try {
    const ip = require('ip');
    const report = {
      userId,
      matchId: matchInfo?.id,
      suspiciousProcesses: processes,
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length
      },
      playerIP: ip.address(),
      timestamp: new Date().toISOString(),
      severity: 'high',
      reportType: 'cheat_detection'
    };

    await axios.post(
      `${API_BASE_URL}/api/ac/reports`,
      report,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Report sent to admins:', report);
  } catch (err) {
    console.error('Failed to send report:', err);
  }
}

// Heartbeat system
function startHeartbeat(userId, token) {
  stopHeartbeat(); // Clear any existing interval
  
  // Send initial heartbeat
  sendHeartbeat(userId, token);
  
  // Send heartbeat every 30 seconds
  heartbeatInterval = setInterval(() => {
    sendHeartbeat(userId, token);
  }, 30000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

async function sendHeartbeat(userId, token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ac/heartbeat`, {
      version: '2.4.1',
      systemInfo: {
        ping: `${Math.floor(Math.random() * 30 + 10)}ms`,
        cpu: `${(Math.random() * 2).toFixed(1)}%`,
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (mainWindow) {
      mainWindow.webContents.send('heartbeat-success', response.data);
    }
  } catch (error) {
    console.error('Heartbeat failed:', error.message);
    if (mainWindow) {
      mainWindow.webContents.send('heartbeat-error', error.message);
    }
  }
}

// IPC handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('start-ac', (event, data) => {
  const { userId, token, matchId } = data;
  startHeartbeat(userId, token);
  startProcessMonitoring(userId, token, matchId);
  event.reply('ac-started');
});

ipcMain.on('stop-ac', () => {
  stopHeartbeat();
  stopProcessMonitoring();
  if (mainWindow) {
    mainWindow.webContents.send('ac-stopped');
  }
});

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

// Handle app quit
app.on('before-quit', () => {
  stopHeartbeat();
  stopProcessMonitoring();
});
