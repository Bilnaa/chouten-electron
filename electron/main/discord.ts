import * as RPC from "discord-rpc";

const clientId = "1148271205569286154";

export default class Discord {
  defaultActivity: RPC.Presence = {
    startTimestamp: new Date(),
    largeImageKey: "icon",
    instance: true,
  };
  disabled = false;
  discord = new RPC.Client({ transport: "ipc" });
  /** @type {Discord['defaultStatus'] | undefined} */
  allowDiscordDetails;
  /** @type {Discord['defaultStatus'] | undefined} */
  cachedPresence;
  constructor() {
    this.discord.on("ready", () => {
      console.log("Discord client ready");
      this.discord.setActivity(this.cachedPresence || this.defaultActivity);
    });
    this.login();
  }

  login() {
    this.discord.login({ clientId }).catch(() => {
      setTimeout(() => this.discord.login({ clientId }), 5000).unref();
    });
    this.disabled = false;
  }
  
  disable() {
    this.discord.clearActivity();
    this.disabled = true;
  }

  isEnabled() {
    return !this.disabled;
  }

  setActivity(presence: RPC.Presence) {
    if (this.disabled) return;
    this.cachedPresence = presence;
    this.discord.setActivity(presence);
  }
}
