import { app, BrowserWindow, ipcMain, Notification } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pomodoroWin = null;
let logsModalWin = null;

function createPomodoroWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 720,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));

  return win;
}

function createLogsWindow(isModal = false, parentWin = null) {
  const win = new BrowserWindow({
    width: 480,
    height: 620,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    parent: isModal ? parentWin : undefined,
    modal: isModal,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "../dist/logs.html"));

  return win;
}

// IPC Handlers - Window controls
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

ipcMain.on('open-logs', (event) => {
  const parentWin = BrowserWindow.fromWebContents(event.sender);
  
  if (logsModalWin && !logsModalWin.isDestroyed()) {
    logsModalWin.focus();
    return;
  }

  logsModalWin = createLogsWindow(true, parentWin);
  
  logsModalWin.on('closed', () => {
    logsModalWin = null;
  });

  logsModalWin.on('blur', () => {
    if (logsModalWin && !logsModalWin.isDestroyed()) {
      logsModalWin.close();
    }
  });
});

ipcMain.on('open-pomodoro', (event) => {
  if (logsModalWin && !logsModalWin.isDestroyed()) {
    logsModalWin.close();
  }
});

ipcMain.on('logs-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('logs-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

// IPC Handlers - Notifications
ipcMain.handle('show-notification', async (event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body
    });
    notification.show();
    return { success: true };
  }
  return { success: false, error: 'Notification not supported' };
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

app.whenReady().then(() => {
  pomodoroWin = createPomodoroWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      pomodoroWin = createPomodoroWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});