import * as RPC from 'discord-rpc'

const clientId = '1148271205569286154';

export default class Discord {
    defaultActivity: RPC.Presence = { 
        startTimestamp: new Date(),
    largeImageKey: 'icon',
    instance: true,
    }
    discord = new RPC.Client({ transport: 'ipc' })
    /** @type {Discord['defaultStatus'] | undefined} */
    allowDiscordDetails
    /** @type {Discord['defaultStatus'] | undefined} */
    cachedPresence
    constructor() {
        this.discord.on('ready', () => {
            console.log('Discord client ready')
            this.discord.setActivity(this.cachedPresence || this.defaultActivity)
        })
        this.discord.login({ clientId }).catch(() => {
            setTimeout(() => this.discord.login({ clientId }), 5000).unref()
        })
    }
    login() {
        this.discord.login({ clientId }).catch(() => {
            setTimeout(() => this.discord.login({ clientId }), 5000).unref()
        })
    }
}