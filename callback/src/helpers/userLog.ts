import { logHandler } from './logHandler'
import { errorHandler } from './logHandler'
import { UserLog, UserLogKWArgs } from '../interfaces/DiscordUser'
import { UserLogModel } from '../models/DiscordUserModel'
import { MongoClient } from './mongo'

export async function logEntry (
    action: string,
    discordId: BigInt,
    entry?: UserLogKWArgs ): Promise<boolean> {
    // 
    // Logs the user's activity into their user log.
    // 
    let savedLogEntry = false
    try  {
        // logHandler.info("logEntry passed to logEntry function: " + entry)
        const userLogEntry: UserLog = new UserLogModel({
            action: action,
            amount: entry?.amount || 0,
            date: new Date,
            discordId: discordId,
            oreId: entry?.oreId || "NA",
            recipient: entry?.recipient || 0,
            txnId: entry?.txnId || "NA",
            status: entry?.status || "NA",
            comment: entry?.comment || "NA"
        })
        // await addLogEntry(userLogEntry)
        savedLogEntry = true
    }
    catch (err) {
        errorHandler('addLogEntry', err)
    }
    return savedLogEntry
}