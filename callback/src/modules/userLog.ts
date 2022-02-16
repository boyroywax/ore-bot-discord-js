import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { UserLog, UserLogKWArgs } from '../interfaces/DiscordUser'
import { UserLogModel } from '../models/DiscordUserModel'
import { addLogEntry } from './mongo'

export async function logEntry (
    action: string,
    discordId: number,
    entry?: UserLogKWArgs ): Promise<boolean> {
    // 
    // Logs the user's activity into their user log.
    // 
    let savedLogEntry = false
    try  {
        logHandler.info("logEntry passed to logEntry function: " + entry)
        let userLogEntry: UserLog = new UserLogModel({
            action: action,
            amount: entry?.amount || 0,
            date: new Date,
            discordId: discordId,
            oreId: entry?.oreId || "NA",
            recipient: entry?.recipient || 0,
            txnId: entry?.txnId || "NA",
            stage: entry?.stage || "NA",
            comment: entry?.comment || "NA"
        })
        await addLogEntry(userLogEntry)
        savedLogEntry = true
    }
    catch (err) {
        errorHandler('logEntry failed: ', err)
    }
    return savedLogEntry
}