import { app, BrowserWindow, shell, ipcMain,protocol,dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'fs'
import { setupIpcHandlers } from './ipcHandlers';
import FastifyServer from './api';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
var hiddenWin: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')
const hiddenHtml = path.join(RENDERER_DIST, 'hidden.html')

function createDirectories() {
  let appDataPath;

  if (process.platform === 'win32') {
    appDataPath = process.env.APPDATA;
  } else if (process.platform === 'darwin') {
    appDataPath = path.join(process.env.HOME, 'Library', 'Application Support');
  } else {
    appDataPath = path.join(process.env.HOME, '.config');
  }

  const choutenPath = path.join(appDataPath, 'chouten');
  const repoPath = path.join(choutenPath, 'Repos');
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
    console.log('Created repo directory');
  } else {
    console.log('repo directory already exists');
  }
}
const ModulesPath = path.join(app.getPath('userData'), 'Modules');
if (!fs.existsSync(ModulesPath)) {
  fs.mkdirSync(ModulesPath, { recursive: true });
} else {
  console.log('Modules folder directory already exists');
}

ipcMain.handle('load-script', async (event, scriptPath) => {
  try {
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    if(hiddenWin) {
      try {
        await hiddenWin.webContents.executeJavaScript(scriptContent);
        return { success: true };
      } catch (error) {
        console.error('Error executing script:', error);
        return { success: false, error: error };
      }
    }
  } catch (error) {
    console.error('Error loading script:', error);
    return { success: false, error: error };
  }
});

ipcMain.handle('execute-script', async (event, scriptContent) => {
  if (hiddenWin) {
    let result;
    try {
      result = await hiddenWin.webContents.executeJavaScript(`(async () => { ${scriptContent} })()`);
      return { success: true, result };
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error('Hidden window not available');
  }
});

ipcMain.on('minimize-window', () => {
  win.minimize();
});

ipcMain.on('maximize-window', () => {
  win.maximize();
});

ipcMain.on('restore-window', () => {
  win.restore();
});

ipcMain.on('close-window', () => {
  win.close();
});

ipcMain.handle('is-maximized', () => {
  return win.isMaximized();
});


async function createWindow() {
  win = new BrowserWindow({
    title: 'Chouten',
    icon: path.join(process.env.VITE_PUBLIC, 'chouten.png'),
    width: 1600,
    height: 900,
    minHeight: 600,
    minWidth: 800,
    frame: false,
    transparent : process.platform === 'win32' || process.platform === 'darwin',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
       color: '#171717',
       symbolColor: '#eee',
       height: 40
     },
    vibrancy: 'fullscreen-ui',
    visualEffectState: 'followWindow',
    webPreferences: {
      preload,
      allowRunningInsecureContent: false,
      enableBlinkFeatures: 'FontAccess, AudioVideoTracks',
      backgroundThrottling: false,
      webSecurity: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(indexHtml)
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  win.webContents.on('devtools-opened', () => process.platform === 'darwin' && win.setVibrancy(null))
  win.webContents.on('devtools-closed', () => process.platform === 'darwin' && win.setVibrancy('under-window'))


  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('did-finish-load', createHiddenWindow)
}

function createHiddenWindow() {
  hiddenWin = new BrowserWindow({
    show: false, 
    icon: path.join(process.env.VITE_PUBLIC, 'chouten.png'),
    webPreferences: {
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false,
      backgroundThrottling: false,
      preload
    }
  });
  if (VITE_DEV_SERVER_URL) {
    hiddenWin.loadURL(`${VITE_DEV_SERVER_URL}/hidden.html`)
      .catch(err => console.error('Error loading hidden window from URL:', err));
  } else {
    hiddenWin.loadFile(hiddenHtml)
      .catch(err => console.error('Error loading hidden window from file:', err));
  }

  hiddenWin.webContents.on('did-finish-load', () => {
    console.log('Hidden window finished loading');
  });

  hiddenWin.on('closed', () => {
    hiddenWin = null;
    console.log('Hidden window closed');
  });
}
protocol.registerSchemesAsPrivileged([{ scheme: 'chouten', privileges: { standard: true, secure: true } }])

const gotTheLock = app.requestSingleInstanceLock()

app.whenReady().then(() => {
  createDirectories();
  createWindow();
  setupIpcHandlers();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.setAsDefaultProtocolClient('chouten')

  
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  if (win) win.focus()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
    parent: win,
    height: win.getBounds().height - 100,
    width: win.getBounds().width - 100,
    modal: true,
    show: false
  })

  if (arg.includes('supabase')) {
    const fastifyServer = new FastifyServer()
    fastifyServer.start()
    childWindow.on('close', () => fastifyServer.stop())
  }

  childWindow.webContents.on('before-input-event', (_, input) => {
    if (input.key === 'Escape') childWindow.close()
  })


  childWindow.once('ready-to-show', () => {
    childWindow.webContents.executeJavaScript(`
      const overlay = document.createElement('div');
      overlay.style = 'position: absolute; top: 0; left: 0; width: 100%; z-index: 9999;';
      overlay.innerHTML = '<div style="background-color: rgb(255 0 0 / 50%); color: white; font-size: 1.5em; padding: 10px; text-align: center;">Press the "Escape" key if you want to close this window</div>';
      document.body.appendChild(overlay);
    `)
    childWindow.show()
  })
  childWindow.loadURL(arg)
  childWindow.webContents.on('will-redirect', (event, url) => {
    if (url.startsWith('http://localhost:8000/auth')) {
      event.preventDefault()
      const [, accessToken] = url.split('#')
      const data = Object.fromEntries(
        accessToken.split('&').map(pair => pair.split('='))
      )
      win?.webContents.executeJavaScript(`localStorage.setItem('supabase.auth.token', '${JSON.stringify(data)}')`)
      childWindow.close()
    }
  })


})
