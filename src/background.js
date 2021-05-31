'use strict';

import { app, protocol, BrowserWindow, Menu, globalShortcut } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      webSecurity: false, // 取消跨域限制
      nodeIntegration: true,
    },
    icon: `${__static}/app.ico`,
  });

  if (process.env.mode === 'development') {
    // 开发环境(development)下打开控制台
    window.webContents.openDevTools({ activate: false });
  }
  await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);

  win.on('closed', () => {
    win = null;
  });

  createMenu();

  // 在开发环境和生产环境均可通过快捷键打开devTools
  globalShortcut.register('CommandOrControl+Shift+i', function() {
    window.webContents.openDevTools({ activate: false });
  });
}

function createMenu() {
  Menu.setApplicationMenu(null);
  //   // darwin表示macOS，针对macOS的设置
  //   const template = [
  //     {
  //       label: 'App Demo',
  //       submenu: [
  //         {
  //           role: 'about',
  //         },
  //         {
  //           role: 'quit',
  //         },
  //       ],
  //     },
  //   ];
  //   let menu = Menu.buildFromTemplate(template);
  //   Menu.setApplicationMenu(menu);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
