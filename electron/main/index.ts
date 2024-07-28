import { app, BrowserWindow, shell, ipcMain,protocol } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'fs'
import { setupIpcHandlers } from './ipcHandlers';
import Discord from './discord'


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
    try {
      const result = await hiddenWin.webContents.executeJavaScript(`(async () => { ${scriptContent} })()`);
      return { success: true, result };
    } catch (error) {
      console.error('Error executing script:', error);
      return { success: false, error: error };
    }
  } else {
    return { success: false, error: 'Hidden window not available' };
  }
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
    backgroundMaterial: 'acrylic',
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

  win.on('closed', () => {
    win = null
    hiddenWin?.close()
    process.exit(0)
  })

  win.webContents.on('devtools-opened', () => {
   if (process.platform === 'darwin') {
    win.setVibrancy(null)
   }
  });
  win.webContents.on('devtools-closed', () => {
    if (process.platform === 'darwin') {
      win.setVibrancy('under-window')
    }
  });

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
      nodeIntegration: true,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false,
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

app.whenReady().then(() => {
  createDirectories();
  createWindow();
  setupIpcHandlers();
  new Discord();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  win = null
  hiddenWin = null
   app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true,
    },
    parent: win,
    modal: true,
    show: false
  })

  childWindow.once('ready-to-show', () => {
    childWindow.show()
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
