import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'fs'
import AdmZip from 'adm-zip'
import axios from 'axios'

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
  } else {
    appDataPath = path.join(process.env.HOME, '.config');
  }

  const choutenPath = path.join(appDataPath, 'Chouten');
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

ipcMain.handle('install-repo', async (event, repoData: string) => {
  try {
    const repo = JSON.parse(repoData);
    const repoPath = path.join(app.getPath('userData'), 'Repos', repo.id);
    
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
    }
    
    const metadataPath = path.join(repoPath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(repo));

    return { success: true };
  } catch (error) {
    console.error('Error installing repo:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('install-module', async (event, repoId: string, moduleId: string) => {
  try {
    const repoPath = path.join(app.getPath('userData'), 'Repos', repoId);
    const metadataPath = path.join(repoPath, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Repo metadata not found');
    }

    const repoData = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const module = repoData.modules.find((m: any) => m.id === moduleId);

    if (!module) {
      throw new Error('Module not found in repo metadata');
    }

    const moduleData = await axios.get(module.filePath, { responseType: 'arraybuffer' });
    const tempModulePath = path.join(repoPath, `${module.name}.module`);

    fs.writeFileSync(tempModulePath, Buffer.from(moduleData.data));

    const zip = new AdmZip(tempModulePath);
    const extractPath = path.join(repoPath, module.name);

    // Create the extraction directory if it doesn't exist
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    // Extract files, ignoring __MACOSX and flattening the structure
    zip.getEntries().forEach((entry) => {
      if (!entry.entryName.startsWith('__MACOSX')) {
        const fileName = path.basename(entry.entryName);
        const content = zip.readFile(entry);
        if (content) {
          fs.writeFileSync(path.join(extractPath, fileName), content);
        }
      }
    });

    // Delete the temporary .module file
    fs.unlinkSync(tempModulePath);

    return { success: true };
  } catch (error) {
    console.error('Error installing module:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('remove-repo', async (event, repoId: string) => {
  try {
    const repoPath = path.join(app.getPath('userData'), 'Repos', repoId);
    fs.rmSync(repoPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error removing repo:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('remove-module', async (event, repoId: string, moduleName: string) => {
  try {
    const modulePath = path.join(app.getPath('userData'), 'Repos', repoId, moduleName);
    fs.rmSync(modulePath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error removing module:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('update-module', async (event, repoId: string, moduleId: string) => {
  try {
    const repoPath = path.join(app.getPath('userData'), 'Repos', repoId);
    const metadataPath = path.join(repoPath, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Repo metadata not found');
    }

    const repoData = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const module = repoData.modules.find((m: any) => m.id === moduleId);

    if (!module) {
      throw new Error('Module not found in repo metadata');
    }

    // Download and update the module
    const moduleData = await axios.get(module.filePath, { responseType: 'arraybuffer' });
    const tempModulePath = path.join(repoPath, `${module.name}.module`);

    fs.writeFileSync(tempModulePath, Buffer.from(moduleData.data));

    const zip = new AdmZip(tempModulePath);
    const extractPath = path.join(repoPath, module.name);

    // Remove existing module files
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }

    // Create the extraction directory
    fs.mkdirSync(extractPath, { recursive: true });

    // Extract files, ignoring __MACOSX and flattening the structure
    zip.getEntries().forEach((entry) => {
      if (!entry.entryName.startsWith('__MACOSX')) {
        const fileName = path.basename(entry.entryName);
        const content = zip.readFile(entry);
        if (content) {
          fs.writeFileSync(path.join(extractPath, fileName), content);
        }
      }
    });

    // Delete the temporary .module file
    fs.unlinkSync(tempModulePath);

    // Update the metadata
    repoData.modules = repoData.modules.map((m: any) => m.id === moduleId ? module : m);
    fs.writeFileSync(metadataPath, JSON.stringify(repoData, null, 2));

    return { success: true };
  } catch (error) {
    console.error('Error updating module:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('get-repo-list', async (event) => {
  try { 
    const repoPath = path.join(app.getPath('userData'), 'Repos');
    const repos = fs.readdirSync(repoPath)
      .filter((file) => file.startsWith('.') === false)
      .map((repoId) => {
        const repo = { id: repoId, modules: [] };
        const repoDir = path.join(repoPath, repoId);
        const moduleDirs = fs.readdirSync(repoDir)
          .filter((file) => file.startsWith('.') === false);
        moduleDirs.forEach((moduleDir) => {
          const modulePath = path.join(repoDir, moduleDir);
          const metadataPath = path.join(modulePath, 'metadata.json');
          if (fs.existsSync(metadataPath)) {
            const metadata = fs.readFileSync(metadataPath, 'utf8');
            const module = JSON.parse(metadata);
            repo.modules.push(module);
          }
        });
        return repo;
      });
    return { success: true, repos };
  } catch (error) {
    console.error('Error getting repo list:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('get-repo-path', async (event, repoId: string) => {
  const repoPath = path.join(app.getPath('userData'), 'Repos', repoId);
  if (fs.existsSync(repoPath)) {
    return { success: true, repoPath };
  }
  return new Error('Repo not found');
});

ipcMain.handle('get-module-path', async (event, repoId: string, moduleName: string) => {
  const modulePath = path.join(app.getPath('userData'), 'Repos', repoId, moduleName);
  if (fs.existsSync(modulePath)) {
    return { success: true, modulePath };
  }
  const modulePath2 = path.join(app.getPath('userData'), 'Modules', moduleName);
  if (fs.existsSync(modulePath2)) {
    return { success: true, modulePath: modulePath2 };
  }
  return new Error('Module not found');
});

ipcMain.handle('get-icon', async (event, repoId: string,moduleName : string) => {
  // get the icon.png from the module folder encode it to base64 and return it
  const modulePath = path.join(app.getPath('userData'), 'Repos', repoId, moduleName);
  if (fs.existsSync(modulePath)) {
    const iconPath = path.join(modulePath, 'icon.png');
    if(fs.existsSync(iconPath)){
      const icon = fs.readFileSync(iconPath);
      return { success: true, icon: icon.toString('base64') };
    }
  }
  return { success: false, error: 'Icon not found' };
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
    vibrancy: 'under-window',
    visualEffectState: 'followWindow',
    transparent : process.platform === 'win32' || process.platform === 'darwin',
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
    // disable vibrancy macos
    win.setVibrancy(null);
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
