// 
// Interface for a discord user.
// 
export interface DiscordUser {
    discordId: number
    loggedIn: boolean
    lastLogin?: Date
    dateCreated?: Date
    oreId?: string
    state?: string
}

//
// Interface for the discord user's log.
// 
export interface UserLog extends UserLogKWArgs {
    id?: Number
    action: string
    date: Date
    discordId: number
}

// 
// Additional Arguments object for adding extra info to the log entry
// 
export interface UserLogKWArgs {
    status?: string
    oreId?: string
    recipient?: number
    amount?: number
    txnId?: string
    comment?: string
}