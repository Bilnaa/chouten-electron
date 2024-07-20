import { ipcMain, app, BrowserWindow } from 'electron';
import path from 'node:path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import axios from 'axios';
import https from 'https';


const ModulesPath = path.join(app.getPath('userData'), 'Modules');


export function setupIpcHandlers() {
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
          const extractPath = path.join(repoPath, module.id);
      
          // Create the extraction directory if it doesn't exist
          if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
          }
      
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
      
      ipcMain.handle('get-module-path', async (event, moduleId: string) => {
        const reposPath = path.join(app.getPath('userData'), 'Repos');
        const repos = fs.readdirSync(reposPath)
          .filter((file) => file.startsWith('.') === false);
        for (const repoId of repos) {
          const repoPath = path.join(reposPath, repoId);
          const modules = fs.readdirSync(repoPath)
            .filter((file) => file.startsWith('.') === false);
          for (const module of modules) {
            if (module === moduleId) {
              return { success: true, modulePath: path.join(repoPath, module) };
            }
          }
        }
        const modulePath = path.join(ModulesPath, moduleId);
        if (fs.existsSync(modulePath)) {
          return { success: true, modulePath };
        }
        return { success: false, error: 'Module not found' };
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

      ipcMain.handle('fetch-stream', async (event, url) => {
        return new Promise((resolve, reject) => {
          https.get(url, (response) => {
            let data = [];
            response.on('data', (chunk) => {
              data.push(chunk);
            });
            response.on('end', () => {
              resolve(Buffer.concat(data));
            });
          }).on('error', (err) => {
            reject(err);
          });
        });
      });
      
      ipcMain.handle('fetch-subtitles', async (event, url) => {
        return new Promise((resolve, reject) => {
          https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
              data += chunk;
            });
            response.on('end', () => {
              resolve(data);
            });
          }).on('error', (err) => {
            reject(err);
          });
        });
      });

      
}