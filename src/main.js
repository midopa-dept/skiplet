const { app, BrowserWindow, dialog, globalShortcut, ipcMain, nativeImage } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');

let mainWindow;
let shortcuts;
let seekSeconds;
let volume;
const defaultShortcuts = {
  toggle: 'CommandOrControl+Option+Space',
  backward: 'CommandOrControl+Option+Left',
  forward: 'CommandOrControl+Option+Right',
  volumeUp: 'CommandOrControl+Option+Up',
  volumeDown: 'CommandOrControl+Option+Down'
};

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    if (saved.settingsVersion !== 4) throw new Error('Old settings format');
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
  fs.writeFileSync(settingsPath(), JSON.stringify({ settingsVersion: 4, shortcuts, seekSeconds, volume }, null, 2));
}

function registerShortcuts(candidate) {
  globalShortcut.unregisterAll();
  const registered = [];
  for (const [command, accelerator] of Object.entries(candidate)) {
    const ok = globalShortcut.register(accelerator, () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('global-shortcut', command);
    });
    if (!ok) {
      globalShortcut.unregisterAll();
      return { ok: false, accelerator };
    }
    registered.push(accelerator);
  }
  return { ok: true, registered };
}

function createWindow() {
  const { width: workWidth, height: workHeight } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: Math.min(560, workWidth - 40),
    height: Math.min(720, workHeight - 40),
    minWidth: 480,
    minHeight: 620,
    center: true,
    title: 'Skiplet',
    backgroundColor: '#111310',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
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
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Audio', extensions: ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) return [];
    return result.filePaths.map((filePath) => ({
      name: path.basename(filePath),
      url: pathToFileURL(filePath).href
    }));
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
    if (commands.some((command) => !/(Command|Control|Option|Alt|Shift)/.test(candidate[command]))) {
      return { ok: false, error: '글로벌 단축키에는 Command, Control, Option 또는 Shift가 포함되어야 합니다.' };
    }

    const previous = { ...shortcuts };
    const registration = registerShortcuts(candidate);
    if (!registration.ok) {
      registerShortcuts(previous);
      return { ok: false, error: `${registration.accelerator} 조합은 macOS 또는 다른 앱에서 사용 중입니다.` };
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
    const previous = { ...shortcuts };
    const registration = registerShortcuts(defaultShortcuts);
    if (!registration.ok) {
      registerShortcuts(previous);
      return { ok: false, error: '기본 글로벌 단축키를 등록할 수 없습니다.' };
    }
    shortcuts = { ...defaultShortcuts };
    saveSettings();
    return { ok: true, shortcuts: { ...shortcuts } };
  });

  createWindow();
  const initialRegistration = registerShortcuts(shortcuts);
  if (!initialRegistration.ok) {
    shortcuts = { ...defaultShortcuts };
    registerShortcuts(shortcuts);
    saveSettings();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => globalShortcut.unregisterAll());
