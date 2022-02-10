export interface OreIdUser {
    discordId: number
    loggedIn: boolean
    lastLogin: Date
    oreId?: string
    state?: string
}