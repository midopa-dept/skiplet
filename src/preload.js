const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('playerAPI', {
  chooseAudio: () => ipcRenderer.invoke('choose-audio'),
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
  setShortcuts: (shortcuts) => ipcRenderer.invoke('set-shortcuts', shortcuts),
  resetShortcuts: () => ipcRenderer.invoke('reset-shortcuts'),
  getSeekSeconds: () => ipcRenderer.invoke('get-seek-seconds'),
  setSeekSeconds: (seconds) => ipcRenderer.invoke('set-seek-seconds', seconds),
  getVolume: () => ipcRenderer.invoke('get-volume'),
  setVolume: (volume) => ipcRenderer.invoke('set-volume', volume),
  onGlobalShortcut: (callback) => ipcRenderer.on('global-shortcut', (_event, command) => callback(command))
});
