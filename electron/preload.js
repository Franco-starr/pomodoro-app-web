const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Pomodoro window controls
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    openLogs: () => ipcRenderer.send('open-logs'),

    // Logs window controls
    logsMinimize: () => ipcRenderer.send('logs-minimize'),
    logsClose: () => ipcRenderer.send('logs-close'),
    openPomodoro: () => ipcRenderer.send('open-pomodoro')
});