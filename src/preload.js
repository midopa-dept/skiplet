const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('playerAPI', {
  chooseAudio: () => ipcRenderer.invoke('choose-audio'),
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
  setShortcuts: (shortcuts) => ipcRenderer.invoke('set-shortcuts', shortcuts),
  resetShortcuts: () => ipcRenderer.invoke('reset-shortcuts'),
  getGlobalShortcuts: () => ipcRenderer.invoke('get-global-shortcuts'),
  setGlobalShortcuts: (shortcuts) => ipcRenderer.invoke('set-global-shortcuts', shortcuts),
  resetGlobalShortcuts: () => ipcRenderer.invoke('reset-global-shortcuts'),
  getSeekSeconds: () => ipcRenderer.invoke('get-seek-seconds'),
  setSeekSeconds: (seconds) => ipcRenderer.invoke('set-seek-seconds', seconds),
  getVolume: () => ipcRenderer.invoke('get-volume'),
  setVolume: (volume) => ipcRenderer.invoke('set-volume', volume),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('set-always-on-top', value),
  onGlobalShortcut: (callback) => ipcRenderer.on('global-shortcut', (_event, command) => callback(command))
});
