const { app, BrowserWindow, dialog, globalShortcut, ipcMain, nativeImage } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');

let mainWindow;
let shortcuts;
let globalShortcuts;
let seekSeconds;
let volume;
let alwaysOnTop;
const defaultShortcuts = {
  toggle: 'Space',
  backward: 'Left',
  forward: 'Right',
  volumeUp: 'Up',
  volumeDown: 'Down'
};
const defaultGlobalShortcuts = {
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
    if (![4, 5, 6].includes(saved.settingsVersion)) throw new Error('Old settings format');
    return {
      shortcuts: saved.settingsVersion === 5 ? { ...defaultShortcuts, ...saved.shortcuts } : { ...defaultShortcuts },
      globalShortcuts: saved.settingsVersion === 5
        ? { ...defaultGlobalShortcuts, ...saved.globalShortcuts }
        : { ...defaultGlobalShortcuts, ...saved.shortcuts },
      seekSeconds: Number.isFinite(saved.seekSeconds) ? saved.seekSeconds : 10,
      volume: Number.isFinite(saved.volume) ? saved.volume : 1,
      alwaysOnTop: saved.settingsVersion === 6 && saved.alwaysOnTop === true
    };
  } catch {
    return { shortcuts: { ...defaultShortcuts }, globalShortcuts: { ...defaultGlobalShortcuts }, seekSeconds: 10, volume: 1, alwaysOnTop: false };
  }
}

function saveSettings() {
  fs.writeFileSync(settingsPath(), JSON.stringify({ settingsVersion: 6, shortcuts, globalShortcuts, seekSeconds, volume, alwaysOnTop }, null, 2));
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
    width: Math.min(480, workWidth - 40),
    height: Math.min(720, workHeight - 40),
    minWidth: 480,
    minHeight: 620,
    center: true,
    title: 'Skiplet',
    alwaysOnTop,
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
  globalShortcuts = settings.globalShortcuts;
  seekSeconds = settings.seekSeconds;
  volume = settings.volume;
  alwaysOnTop = settings.alwaysOnTop;

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
  ipcMain.handle('get-global-shortcuts', () => ({ ...globalShortcuts }));
  ipcMain.handle('get-seek-seconds', () => seekSeconds);
  ipcMain.handle('get-volume', () => volume);
  ipcMain.handle('get-always-on-top', () => alwaysOnTop);
  ipcMain.handle('set-always-on-top', (_event, value) => {
    alwaysOnTop = value === true;
    mainWindow.setAlwaysOnTop(alwaysOnTop);
    saveSettings();
    return { ok: true, alwaysOnTop };
  });
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

  ipcMain.handle('set-global-shortcuts', (_event, candidate) => {
    const commands = Object.keys(defaultGlobalShortcuts);
    if (!candidate || commands.some((command) => typeof candidate[command] !== 'string')) return { ok: false, error: '올바르지 않은 글로벌 단축키 설정입니다.' };
    if (new Set(commands.map((command) => candidate[command])).size !== commands.length) return { ok: false, error: '각 기능에 서로 다른 글로벌 단축키를 지정하세요.' };
    if (commands.some((command) => !/(Command|Control|Option|Alt|Shift)/.test(candidate[command]))) return { ok: false, error: '글로벌 단축키에는 보조키가 포함되어야 합니다.' };
    const previous = { ...globalShortcuts };
    const registration = registerShortcuts(candidate);
    if (!registration.ok) {
      registerShortcuts(previous);
      return { ok: false, error: `${registration.accelerator} 조합은 macOS 또는 다른 앱에서 사용 중입니다.` };
    }
    globalShortcuts = { ...candidate };
    saveSettings();
    return { ok: true, shortcuts: { ...globalShortcuts } };
  });

  ipcMain.handle('reset-shortcuts', () => {
    shortcuts = { ...defaultShortcuts };
    saveSettings();
    return { ok: true, shortcuts: { ...shortcuts } };
  });

  ipcMain.handle('reset-global-shortcuts', () => {
    const previous = { ...globalShortcuts };
    const registration = registerShortcuts(defaultGlobalShortcuts);
    if (!registration.ok) {
      registerShortcuts(previous);
      return { ok: false, error: '기본 글로벌 단축키를 등록할 수 없습니다.' };
    }
    globalShortcuts = { ...defaultGlobalShortcuts };
    saveSettings();
    return { ok: true, shortcuts: { ...globalShortcuts } };
  });

  createWindow();
  const initialRegistration = registerShortcuts(globalShortcuts);
  if (!initialRegistration.ok) {
    globalShortcuts = { ...defaultGlobalShortcuts };
    registerShortcuts(globalShortcuts);
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
