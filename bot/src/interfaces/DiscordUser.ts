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
    pendingTransaction?: number
}

export interface DiscordUserReturn {
    discordId: string
    loggedIn: boolean
    lastLogin?: Date
    dateCreated?: Date
    oreId?: string
    state?: string
    pendingTransaction?: number
}

// 
// Interface for the discord user's bot balance.
// 
export interface ActiveBalance {
    discordId: bigint
    activeToken: string
    activeBalance: number
}

export interface ActiveBalanceReturn {
    discordId: string
    activeToken: string
    activeBalance: number
}

//
// Interface for the discord user's log.
// 
export interface UserLog extends UserLogKWArgs {
    id?: number
    action: string
    date: Date
    discordId: bigint
}

export interface UserLogReturn extends UserLogKWArgsReturn {
    id?: number
    action: string
    date: Date
    discordId: string
}

// 
// Additional Arguments for adding extra info to the log entry
// 
export interface UserLogKWArgs {
    status?: string
    oreId?: string
    recipient?: bigint
    amount?: number
    txnId?: string
    comment?: string
    ip?: string
}

export interface UserLogKWArgsReturn {
    status?: string
    oreId?: string
    recipient?: string
    amount?: number
    txnId?: string
    comment?: string
    ip?: string
}