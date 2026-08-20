const { app, BrowserWindow, dialog, ipcMain, nativeImage } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');

let mainWindow;
let shortcuts;
let seekSeconds;
let volume;
const defaultShortcuts = {
  toggle: 'Space',
  backward: 'Left',
  forward: 'Right',
  volumeUp: 'Up',
  volumeDown: 'Down'
};

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    if (![2, 3].includes(saved.settingsVersion)) throw new Error('Old settings format');
    return {
      shortcuts: { ...defaultShortcuts, ...saved.shortcuts },
      seekSeconds: Number.isFinite(saved.seekSeconds) ? saved.seekSeconds : 10,
      volume: Number.isFinite(saved.volume) ? saved.volume : 1
    };
  } catch {
    return { shortcuts: { ...defaultShortcuts }, seekSeconds: 10, volume: 1 };
  }
}

function saveSettings() {
  fs.writeFileSync(settingsPath(), JSON.stringify({ settingsVersion: 3, shortcuts, seekSeconds, volume }, null, 2));
}

function createWindow() {
  const { width: workWidth, height: workHeight } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: Math.min(460, workWidth - 40),
    height: Math.min(500, workHeight - 40),
    minWidth: 400,
    minHeight: 450,
    center: true,
    title: 'Skiplet',
    backgroundColor: '#171817',
    icon: path.join(__dirname, '..', 'assets', 'skiplet-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(nativeImage.createFromPath(path.join(__dirname, '..', 'assets', 'skiplet-icon.png')));
  }
  const settings = loadSettings();
  shortcuts = settings.shortcuts;
  seekSeconds = settings.seekSeconds;
  volume = settings.volume;

  ipcMain.handle('choose-audio', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Audio', extensions: ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    const filePath = result.filePaths[0];
    return { name: path.basename(filePath), url: pathToFileURL(filePath).href };
  });

  ipcMain.handle('get-shortcuts', () => ({ ...shortcuts }));
  ipcMain.handle('get-seek-seconds', () => seekSeconds);
  ipcMain.handle('get-volume', () => volume);
  ipcMain.handle('set-volume', (_event, value) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue) || nextValue < 0 || nextValue > 1) return { ok: false };
    volume = nextValue;
    saveSettings();
    return { ok: true, volume };
  });
  ipcMain.handle('set-seek-seconds', (_event, value) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue) || nextValue < 1 || nextValue > 3600) {
      return { ok: false, error: '이동 시간은 1초에서 3600초 사이여야 합니다.' };
    }
    seekSeconds = Math.round(nextValue);
    saveSettings();
    return { ok: true, seekSeconds };
  });
  ipcMain.handle('set-shortcuts', (_event, candidate) => {
    const commands = Object.keys(defaultShortcuts);
    if (!candidate || commands.some((command) => typeof candidate[command] !== 'string')) {
      return { ok: false, error: '올바르지 않은 단축키 설정입니다.' };
    }
    if (new Set(commands.map((command) => candidate[command])).size !== commands.length) {
      return { ok: false, error: '각 기능에 서로 다른 단축키를 지정하세요.' };
    }

    shortcuts = { ...candidate };
    try {
      saveSettings();
      return { ok: true, shortcuts: { ...shortcuts } };
    } catch (error) {
      return { ok: false, error: `설정을 저장하지 못했습니다: ${error.message}` };
    }
  });

  ipcMain.handle('reset-shortcuts', () => {
    shortcuts = { ...defaultShortcuts };
    saveSettings();
    return { ok: true, shortcuts: { ...shortcuts } };
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
