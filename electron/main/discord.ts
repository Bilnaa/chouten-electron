import * as RPC from "discord-rpc";
import fs from "fs";
import path from "node:path";

const clientId = "1148271205569286154";
const appDataPath = (() => {
  if (process.platform === 'win32') return process.env.APPDATA;
  if (process.platform === 'darwin') return path.join(process.env.HOME!, 'Library', 'Application Support');
  return path.join(process.env.HOME!, '.config');
})();

const choutenPath = path.join(appDataPath, 'chouten');
const configPath = path.join(choutenPath, 'config.json');

export default class Discord {
  private readonly defaultActivity: RPC.Presence = {
    startTimestamp: new Date(),
    largeImageKey: "icon",
    instance: true,
  };
  private disabled = false;
  private readonly discord = new RPC.Client({ transport: "ipc" });
  private cachedPresence?: RPC.Presence;

  constructor() {
    this.discord.on("ready", () => {
      console.log("Discord client ready");
      this.discord.setActivity(this.cachedPresence || this.defaultActivity);
    });
    this.login();
  }

  private async readConfig(): Promise<{ discord: boolean }> {
    if (!fs.existsSync(configPath)) {
      const defaultConfig = { discord: true };
      await fs.promises.writeFile(configPath, JSON.stringify(defaultConfig));
      console.log('Created config file');
      return defaultConfig;
    }
    return JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
  }

  private async writeConfig(config: { discord: boolean }): Promise<void> {
    await fs.promises.writeFile(configPath, JSON.stringify(config));
  }

  async login(): Promise<void> {
    if (this.disabled) return;

    const config = await this.readConfig();
    if (!config.discord) {
      this.disable();
      return;
    }

    try {
      await this.discord.login({ clientId });
    } catch {
      setTimeout(() => this.discord.login({ clientId }), 5000).unref();
    }
    this.disabled = false;
  }
  
  async disable(): Promise<void> {
    this.discord.clearActivity();
    this.disabled = true;
    await this.writeConfig({ discord: false });
  }

  async isEnabled(): Promise<boolean> {
    const config = await this.readConfig();
    return config.discord;
  }

  setActivity(presence: RPC.Presence): void {
    if (this.disabled) return;
    this.cachedPresence = presence;
    this.discord.setActivity(presence);
  }
}