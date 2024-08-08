import { ipcMain, app} from 'electron';
import path from 'node:path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import axios from 'axios';
import Discord from './discord'


const ModulesPath = path.join(app.getPath('userData'), 'Modules');

export function setupIpcHandlers() {
    let discord = new Discord();
    ipcMain.handle('get-discord-status', async (event) => {
        return discord.isEnabled();
      });

      ipcMain.handle('enable-discord', async (event) => {
        discord.login();
      });

      ipcMain.handle('disable-discord', async (event) => {
        discord.disable();
      });
      
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
      
      ipcMain.handle('remove-module', async (event, repoName: string, moduleId: string) => {
        try {
          const repoPath = path.join(app.getPath('userData'), 'Repos', repoName,'Modules', moduleId);
          fs.rmSync(repoPath, { recursive: true });
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
          if(!module.filePath.includes('https://')){
            if (module.filePath.startsWith('./')) {
              module.filePath = module.filePath.slice(1);
            }
            module.filePath = repoData.url + module.filePath;
          }

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
          const reposPath = path.join(app.getPath('userData'), 'Repos');
          const repos = fs.readdirSync(reposPath)
            .filter((file) => file.startsWith('.') === false);
          const repoList = [];
          for (const repoId of repos) {
            const repoPath = path.join(reposPath, repoId);
            const metadataPath = path.join(repoPath, 'metadata.json');
            if (fs.existsSync(metadataPath)) {
              const repoData = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
              repoData.icon = 'data:image/png;base64,' + fs.readFileSync(path.join(repoPath, 'icon.png')).toString('base64');
              const modules = fs.readdirSync(repoPath)
                .filter((file) => file.startsWith('.') === false);
              for (const module of repoData.modules) {
                const modulePath = path.join(repoPath+'/Modules/', module.id);
                if (modules.includes(module.id) || fs.existsSync(modulePath)) {
                  module.installed = true;
                  const moduleFiles = fs.readdirSync(modulePath);
                  for (const file of moduleFiles) {
                    if (file.startsWith('icon')) {
                      module.iconPath = 'data:image/png;base64,' + fs.readFileSync(path.join(modulePath, file)).toString('base64');
                      break;
                    }
                  }
                }
              }
              repoList.push(repoData);
            }
          }
          return { success: true, repoList };
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
        try {
          const ModulesFolder= fs.readdirSync(ModulesPath);
          if(ModulesFolder.filter( 
            (file) => file.startsWith('.') === false
          ).includes(moduleId)){
            return { success: true, modulePath: path.join(ModulesPath, moduleId) };
          }
          const reposFolder = fs.readdirSync(path.join(app.getPath('userData'), 'Repos')).filter((file) => file.startsWith('.') === false);
          for(const repo of reposFolder){
            // get inside the Modules folder of the repo
            const repoPath = path.join(app.getPath('userData'), 'Repos', repo, 'Modules');
            if(fs.existsSync(repoPath)){
              const modules = fs.readdirSync(repoPath).filter((file) => file.startsWith('.') === false);
              if(modules.includes(moduleId)){
                return { success: true, modulePath: path.join(repoPath, moduleId) };
              }
              break;
            }
            return { success: false, error: 'Module not found' };
          }
          return { success: false, error: 'Module not found' };
        } catch (error) {
          console.error('Error getting module path:', error);
          return { success: false, error: (error as Error).message };
        }
      });

      ipcMain.handle('get-module-list', async (event) => {
        try {
          const modules = [];
          const ModulesFolder= fs.readdirSync(ModulesPath);
          for(const module of ModulesFolder){
            if(module.startsWith('.')){
              continue;
            }
            const modulePath = path.join(ModulesPath, module);
            const metadataPath = path.join(modulePath, 'metadata.json');
            if (fs.existsSync(metadataPath)) {
              const moduleData = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
              const moduleFiles = fs.readdirSync(modulePath);
              for (const file of moduleFiles) {
                if (file.startsWith('icon')) {
                  moduleData.iconPath = 'data:image/png;base64,' + fs.readFileSync(path.join(modulePath, file)).toString('base64');
                  break;
                }
              }
              modules.push(moduleData);
            }
          }
          return { success: true, moduleList: modules };
        } catch (error) {
          console.error('Error getting module list:', error);
          return { success: false, error: (error as Error).message };
        }
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

      ipcMain.handle('set-discord-presence', async (event, presence) => {
        discord.setActivity(presence);
      });
}