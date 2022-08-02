import { DiscordUser, DiscordUserReturn, UserLog, UserLogReturn } from "../interfaces/DiscordUser"

export const mongoUri = process.env.MONGO_URI || "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"

export const convertUserToReturn = (result: DiscordUser): DiscordUserReturn => {
    const discordUser: DiscordUserReturn = {
        discordId: result.discordId.toString(),
        loggedIn: result.loggedIn,
        lastLogin: result.lastLogin,
        dateCreated: result.dateCreated,
        oreId: result.oreId,
        state: result.state,
        pendingTransaction: result.pendingTransaction
    }
    return discordUser
}

export const convertLogToReturn = (result: UserLog): UserLogReturn => {
    const entry: UserLogReturn = {
        action: result.action,
        status: result.status,
        amount: result.amount,
        date: result.date,
        ip: result.ip,
        discordId: result.discordId?.toString(),
        oreId: result.oreId,
        recipient: result.recipient?.toString(),
        txnId: result.txnId,
        comment: result.comment
    }
    return entry
}