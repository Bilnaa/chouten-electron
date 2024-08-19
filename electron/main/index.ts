import { app, BrowserWindow, shell, ipcMain, protocol, IpcMainInvokeEvent } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'fs';
import { setupIpcHandlers } from './ipcHandlers';
import FastifyServer from './api';

class ChoutenApp {
  private mainWindow: BrowserWindow | null = null;
  private hiddenWindow: BrowserWindow | null = null;
  private fastifyServer: FastifyServer | null = null;
  private readonly mainDist: string;
  private readonly rendererDist: string;
  private readonly viteDevServerUrl: string | undefined;
  private readonly preloadPath: string;
  private readonly indexHtmlPath: string;
  private readonly hiddenHtmlPath: string;

  constructor() {
    const require = createRequire(import.meta.url);
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    process.env.APP_ROOT = path.join(__dirname, '../..');

    this.mainDist = path.join(process.env.APP_ROOT, 'dist-electron');
    this.rendererDist = path.join(process.env.APP_ROOT, 'dist');
    this.viteDevServerUrl = process.env.VITE_DEV_SERVER_URL;

    process.env.VITE_PUBLIC = this.viteDevServerUrl
      ? path.join(process.env.APP_ROOT, 'public')
      : this.rendererDist;

    this.preloadPath = path.join(__dirname, '../preload/index.mjs');
    this.indexHtmlPath = path.join(this.rendererDist, 'index.html');
    this.hiddenHtmlPath = path.join(this.rendererDist, 'hidden.html');

    this.initApp();
  }

  private initApp(): void {
    if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();
    if (process.platform === 'win32') app.setAppUserModelId(app.getName());

    if (!app.requestSingleInstanceLock()) {
      app.quit();
      process.exit(0);
    }

    this.setupEventListeners();
    this.createDirectories();
    this.setupIpcHandlers();
  }

  private setupEventListeners(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.createHiddenWindow();
      this.setupProtocol();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) this.createMainWindow();
    });

    app.on('open-url', (event, url) => {
      event.preventDefault();
      if (this.mainWindow) this.mainWindow.focus();
    });

    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }
    });
  }

  private createDirectories(): void {
    let appDataPath: string;

    if (process.platform === 'win32') {
      appDataPath = process.env.APPDATA!;
    } else if (process.platform === 'darwin') {
      appDataPath = path.join(process.env.HOME!, 'Library', 'Application Support');
    } else {
      appDataPath = path.join(process.env.HOME!, '.config');
    }

    const choutenPath = path.join(appDataPath, 'chouten');
    const repoPath = path.join(choutenPath, 'Repos');
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
      console.log('Created repo directory');
    } else {
      console.log('repo directory already exists');
    }

    const ModulesPath = path.join(app.getPath('userData'), 'Modules');
    if (!fs.existsSync(ModulesPath)) {
      fs.mkdirSync(ModulesPath, { recursive: true });
    } else {
      console.log('Modules folder directory already exists');
    }
  }

  private setupIpcHandlers(): void {
    setupIpcHandlers();
    this.setupCustomIpcHandlers();
  }

  private setupCustomIpcHandlers(): void {
    ipcMain.handle('load-script', this.handleLoadScript.bind(this));
    ipcMain.handle('execute-script', this.handleExecuteScript.bind(this));
    ipcMain.on('minimize-window', this.handleMinimizeWindow.bind(this));
    ipcMain.on('maximize-window', this.handleMaximizeWindow.bind(this));
    ipcMain.on('restore-window', this.handleRestoreWindow.bind(this));
    ipcMain.on('close-window', this.handleCloseWindow.bind(this));
    ipcMain.handle('is-maximized', this.handleIsMaximized.bind(this));
    ipcMain.handle('show-hidden-window', this.handleShowHiddenWindow.bind(this));
    ipcMain.handle('hide-hidden-window', this.handleHideHiddenWindow.bind(this));
    ipcMain.handle('open-win', this.handleOpenWin.bind(this));
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      title: 'Chouten',
      icon: path.join(process.env.VITE_PUBLIC!, 'chouten.png'),
      width: 1600,
      height: 900,
      minHeight: 600,
      minWidth: 800,
      frame: false,
      transparent: process.platform === 'darwin',
      titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
      titleBarOverlay: {
        height: 40
      },
      vibrancy: 'fullscreen-ui',
      visualEffectState: 'followWindow',
      webPreferences: {
        preload: this.preloadPath,
        allowRunningInsecureContent: false,
        enableBlinkFeatures: 'FontAccess, AudioVideoTracks',
        backgroundThrottling: false,
        webSecurity: false,
      },
    });

    this.mainWindow.on('maximize', () => {
      console.log('Window is maximized');
      this.mainWindow?.webContents.executeJavaScript(
        `localStorage.setItem('isMaximized', true);`
      );
    });

    this.mainWindow.on('unmaximize', () => {
      console.log('Window is not maximized');
      this.mainWindow?.webContents.executeJavaScript(
        `localStorage.setItem('isMaximized', false);`
      );
    });

    if (this.viteDevServerUrl) {
      this.mainWindow.loadURL(this.viteDevServerUrl);
    } else {
      this.mainWindow.loadFile(this.indexHtmlPath);
    }

    this.mainWindow.on('closed', () => {
      console.log('Window is closing');
      this.hiddenWindow?.close();
      app.quit();
    });

    this.mainWindow.webContents.on('devtools-opened', () => 
      process.platform === 'darwin' && this.mainWindow?.setVibrancy(null)
    );
    this.mainWindow.webContents.on('devtools-closed', () => 
      process.platform === 'darwin' && this.mainWindow?.setVibrancy('under-window')
    );

    this.mainWindow.webContents.on('did-finish-load', () => {
      this.mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
      this.mainWindow?.webContents.executeJavaScript(
        `localStorage.setItem('isMaximized', ${this.mainWindow.isMaximized()})`
      );
    });

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private createHiddenWindow(): void {
    this.hiddenWindow = new BrowserWindow({
      show: false,
      icon: path.join(process.env.VITE_PUBLIC!, 'chouten.png'),
      webPreferences: {
        contextIsolation: true,
        webviewTag: true,
        webSecurity: false,
        backgroundThrottling: false,
        preload: this.preloadPath
      }
    });
    this.hiddenWindow.setClosable(false);
    this.hiddenWindow.setSkipTaskbar(true);

    if (this.viteDevServerUrl) {
      this.hiddenWindow.loadURL(`${this.viteDevServerUrl}/hidden.html`)
        .catch(err => console.error('Error loading hidden window from URL:', err));
    } else {
      this.hiddenWindow.loadFile(this.hiddenHtmlPath)
        .catch(err => console.error('Error loading hidden window from file:', err));
    }

    this.hiddenWindow.webContents.on('did-finish-load', () => {
      console.log('Hidden window finished loading');
    });
  }

  private setupProtocol(): void {
    protocol.registerSchemesAsPrivileged([{ scheme: 'chouten', privileges: { standard: true, secure: true } }]);
    app.setAsDefaultProtocolClient('chouten');
  }

  // IPC handler methods
  private async handleLoadScript(event: IpcMainInvokeEvent, scriptPath: string): Promise<{ success: boolean; error?: Error }> {
    try {
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      if (this.hiddenWindow) {
        try {
          await this.hiddenWindow.webContents.executeJavaScript(scriptContent);
          return { success: true };
        } catch (error) {
          console.error('Error executing script:', error);
          return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
        }
      }
      return { success: false, error: new Error('Hidden window not available') };
    } catch (error) {
      console.error('Error loading script:', error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  private async handleExecuteScript(event: IpcMainInvokeEvent, scriptContent: string): Promise<{ success: boolean; result?: any }> {
    if (this.hiddenWindow) {
      try {
        const result = await this.hiddenWindow.webContents.executeJavaScript(`(async () => { ${scriptContent} })()`);
        return { success: true, result };
      } catch (error) {
        throw new Error(String(error));
      }
    } else {
      throw new Error('Hidden window not available');
    }
  }

  private handleMinimizeWindow(): void {
    this.mainWindow?.minimize();
  }

  private handleMaximizeWindow(): void {
    this.mainWindow?.maximize();
  }

  private handleRestoreWindow(): void {
    this.mainWindow?.unmaximize();
  }

  private handleCloseWindow(): void {
    this.mainWindow?.close();
  }

  private handleIsMaximized(): boolean {
    return this.mainWindow?.isMaximized() ?? false;
  }

  private handleShowHiddenWindow(): void {
    this.hiddenWindow?.show();
    this.hiddenWindow?.webContents.openDevTools();
  }

  private handleHideHiddenWindow(): void {
    this.hiddenWindow?.hide();
    if (this.hiddenWindow?.webContents.isDevToolsOpened()) {
      this.hiddenWindow.webContents.closeDevTools();
    }
  }

  private handleOpenWin(_: IpcMainInvokeEvent, arg: string): void {
    const childWindow = new BrowserWindow({
      frame: false,
      webPreferences: {
        preload: this.preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
      },
      parent: this.mainWindow!,
      height: this.mainWindow!.getBounds().height - 100,
      width: this.mainWindow!.getBounds().width - 100,
      modal: true,
      show: false
    });

    if (arg.includes('supabase')) {
      this.fastifyServer = new FastifyServer();
      this.fastifyServer.start();
      childWindow.on('close', () => this.fastifyServer?.stop());
    }

    childWindow.webContents.on('before-input-event', (_, input) => {
      if (input.key === 'Escape') childWindow.close();
    });

    childWindow.once('ready-to-show', () => {
      childWindow.webContents.executeJavaScript(`
        const overlay = document.createElement('div');
        overlay.style = 'position: absolute; top: 0; left: 0; width: 100%; z-index: 9999;';
        overlay.innerHTML = '<div style="background-color: rgb(255 0 0 / 50%); color: white; font-size: 1.5em; padding: 10px; text-align: center;">Press the "Escape" key if you want to close this window</div>';
        document.body.appendChild(overlay);
      `);
      childWindow.show();
    });

    childWindow.loadURL(arg);
    childWindow.webContents.on('will-redirect', (event, url) => {
      if (url.startsWith('http://localhost:8000/auth')) {
        event.preventDefault();
        const [, accessToken] = url.split('#');
        const data = Object.fromEntries(
          accessToken.split('&').map(pair => pair.split('='))
        );
        this.mainWindow?.webContents.executeJavaScript(`localStorage.setItem('supabase.auth.token', '${JSON.stringify(data)}')`);
        childWindow.close();
      }
    });
  }
}

new ChoutenApp();
