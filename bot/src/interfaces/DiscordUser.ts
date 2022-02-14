export interface DiscordUser {
    discordId: number
    loggedIn: boolean
    lastLogin?: Date
    dateCreated?: Date
    oreId?: string
    state?: string
}

export interface BotBalance {
    discordId: number
    botToken: string
    botBalance: number
}