import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'fs'
import AdmZip from 'adm-zip'

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
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

function createDirectories() {
  let appDataPath;

  if (process.platform === 'win32') {
    appDataPath = process.env.APPDATA;
  } else if (process.platform === 'darwin') {
    appDataPath = path.join(process.env.HOME, 'Library', 'Application Support');
    console.log('appDataPath:', appDataPath);
  } else {
    appDataPath = path.join(process.env.HOME, '.config');
  }

  const choutenPath = path.join(appDataPath, 'Chouten');
  const repoPath = path.join(choutenPath, 'repo');
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
    console.log('Created repo directory');
  } else {
    console.log('repo directory already exists');
  }
}

// Register IPC handlers
ipcMain.handle('install-module', async (event, repoId: string, moduleData: ArrayBuffer, moduleName: string) => {
  try {
    const repoPath = path.join(app.getPath('userData'), 'Repos', repoId);
    const modulePath = path.join(repoPath, moduleName);

    if (!fs.existsSync(modulePath)) {
      fs.mkdirSync(modulePath, { recursive: true });
    }

    const moduleFilePath = path.join(modulePath, `${moduleName}.module`);
    
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(moduleData);

    fs.writeFileSync(moduleFilePath, buffer);

    // Unzip the module file
    const zip = new AdmZip(moduleFilePath);
    zip.extractAllTo(modulePath, true);

    // Delete the original .module file
    fs.unlinkSync(moduleFilePath);

    return { success: true };
  } catch (error) {
    console.error('Error installing module:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('remove-repo', async (event, repoId: string) => {
  try {
    const repoPath = path.join(app.getPath('userData'), 'Repos', repoId);
    fs.rmdirSync(repoPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error removing repo:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('remove-module', async (event, repoId: string, moduleName: string) => {
  try {
    const modulePath = path.join(app.getPath('userData'), 'Repos', repoId, moduleName);
    fs.rmdirSync(modulePath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error removing module:', error);
    return { success: false, error: (error as Error).message };
  }
});

async function createWindow() {
  win = new BrowserWindow({
    title: 'Chouten',
    icon: path.join(process.env.VITE_PUBLIC, 'chouten.png'),
    width: 1600,
    height: 900,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#171717',
      symbolColor: '#eee',
      height: 40
    },
    roundedCorners: true,
    backgroundMaterial: 'acrylic',
    // vibrancy: 'under-window',
    visualEffectState: 'followWindow',
    transparent : process.platform === 'win32' || process.platform === 'darwin',
    webPreferences: {
      preload,
      allowRunningInsecureContent: false,
      enableBlinkFeatures: 'FontAccess, AudioVideoTracks',
      backgroundThrottling: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createDirectories();
  createWindow();

  app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
      allWindows[0].focus()
    } else {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
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
      contextIsolation: false,
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
