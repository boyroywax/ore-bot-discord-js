// 
// Interface for a discord user.
// 
export interface DiscordUser {
   discordId: bigint
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
    discordId: bigint
}

// 
// Additional Arguments object for adding extra info to the log entry
// 
export interface UserLogKWArgs {
    status?: string
    oreId?: string
    recipient?: bigint
    amount?: number
    txnId?: string
    comment?: string
}