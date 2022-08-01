
import { connect, disconnect, QueryOptions } from 'mongoose'

import { UserLog, UserLogKWArgs } from '../interfaces/DiscordUser'
import { UserLogModel } from '../models/DiscordUserModel'
import { debugLogger, errorLogger } from "../utils/logHandler"
import { mongoUri } from '../utils/mongo'


async function createEntry( entry: UserLog ): Promise<boolean> {
    let saveStatus: boolean = false
    await connect(mongoUri)
    try {        
        await UserLogModel.create(entry)
        saveStatus = true
    }
    catch (err) {
        errorLogger("addLog", err)
    }
    finally {
        await disconnect()
    }
    return saveStatus
}

async function getEntries( discordId: bigint, min: number, limit: number ): Promise<UserLog[]> {
    // 
    // Fetches a UserLog list, including activity as a receiver
    // Filters for unique entries (as to not have entries duplicated
    // when the user is both a sender and receiver/a tranfser)
    // 
    let logEntries: UserLog[] = []
    await connect(mongoUri)
    try {
        const options: QueryOptions = {}
        await UserLogModel.find({"discordId": discordId})
            .sort("-date")
            .limit(limit).skip(min).exec()
            .then( async function(docs) {
                for (let doc in docs) {
                    logEntries.push(docs[doc])
                }
        })
        await UserLogModel.find({"recipient": discordId})
            .sort("-date")
            .limit(limit).skip(min).exec()
            .then( async function(docs) {
                for (let doc in docs) {
                    logEntries.push(docs[doc])
                }
        })
        // logEntries = compareLogEntries( logEntries )
    }
    catch (err) {
        errorLogger("getEntries", err)
    }
    finally {
        await disconnect()
    }
    return logEntries
}

export async function logEntry (
    action: string,
    discordId: bigint,
    entry?: UserLogKWArgs ): Promise<boolean> {
    // 
    // Logs the user's activity into their user log.
    // 
    let savedLogEntry = false
    try  {
        // logHandler.info("logEntry passed to logEntry function: " + JSON.stringify(entry))
        const userLogEntry: UserLog = new UserLogModel({
            action: action,
            amount: entry?.amount || 0,
            comment: entry?.comment || "NA",
            date: new Date,
            discordId: discordId,
            oreId: entry?.oreId || "NA",
            recipient: entry?.recipient || 0,
            status: entry?.status || "NA",
            txnId: entry?.txnId || "NA"
        })
        await createEntry(userLogEntry)
        savedLogEntry = true
    }
    catch (err) {
        errorLogger('logEntry in userLog.ts', err)
    }
    return savedLogEntry
}

export async function listLastActivity ( discordId: bigint, min: number = 0, limit: number = 20 ): Promise<UserLog[]> {
    // 
    // Returns a list of logEntries for a user
    // Sorted in descending date order
    // Leaves only uniqe values
    // 
    let userLogEntries: UserLog[] = []
    try {
        userLogEntries = await getEntries(discordId, 0, 20)
        let sortedEntries = userLogEntries.sort((a: UserLog ,b: UserLog) => +new Date(b.date) - +new Date(a.date))
        
        // create a new list with only unique entries
        let uniqueEntries = [sortedEntries[0]];
        for (let i = 1; i < sortedEntries.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if (sortedEntries[i-1].date.toString() != sortedEntries[i].date.toString()) {
                debugLogger(JSON.stringify(sortedEntries[i]))
                uniqueEntries.push(sortedEntries[i]);
            }
        }
        userLogEntries = uniqueEntries
    }
    catch (err) {
        errorLogger("listLastActivity in userLog.ts", err)
    }
    return userLogEntries
}