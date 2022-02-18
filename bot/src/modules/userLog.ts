import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { UserLog, UserLogKWArgs } from '../interfaces/DiscordUser'
import { UserLogModel } from '../models/DiscordUserModel'
import { addLogEntry, getLogEntries } from './mongo'

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
            status: entry?.status || "NA",
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


export async function listActivity ( discordId: number ): Promise<UserLog[]> {
    // 
    // Returns a list of logEntries for a user
    // Sorted in descending date order
    // 
    let userLogEntries: UserLog[] = []
    try {
        userLogEntries = await getLogEntries(discordId)
        userLogEntries.sort((a: UserLog ,b: UserLog) => +new Date(b.date) - +new Date(a.date))
    }
    catch (err) {
        errorHandler("listActivity failed: ", err)
    }
    return userLogEntries
}