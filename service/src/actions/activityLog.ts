import { connect, disconnect } from 'mongoose'

import { UserLog, UserLogKWArgs } from '../interfaces/DiscordUser'
import { UserLogModel } from '../models/DiscordUserModel'
import { errorLogger } from "../utils/logHandler"
import { mongoUri } from '../utils/mongo'


export async function addLogEntry (
    action: string,
    discordId: BigInt,
    entry?: UserLogKWArgs ): Promise<boolean> {
    // 
    // Logs the user's activity into their user log.
    // 
    let savedLogEntry = false
    try  {
        // debugLogger("logEntry passed to logEntry function: " + entry)
        let userLogEntry: UserLog = new UserLogModel({
            action: action,
            amount: entry?.amount || 0,
            date: new Date,
            discordId: discordId || BigInt(0),
            ip: entry?.ip || "NA",
            oreId: entry?.oreId || "NA",
            recipient: entry?.recipient || 0,
            txnId: entry?.txnId || "NA",
            status: entry?.status || "NA",
            comment: entry?.comment || "NA"
        })
        await createEntry(userLogEntry)
        savedLogEntry = true
    }
    catch (err) {
        errorLogger('logEntry failed: ', err)
    }
    return savedLogEntry
}

async function createEntry( entry: UserLog ): Promise<boolean> {
    let saveStatus: boolean = false
    await connect(mongoUri)
    try {        
        await UserLogModel.create(entry)
        saveStatus = true
    }
    catch (err) {
        errorLogger("addLog Entry Failed: ", err)
    }
    finally {
        await disconnect()
    }
    return saveStatus
}

async function getEntries( discordId: bigint ): Promise<UserLog[]> {
    // 
    // Fetches a UserLog list, including activity as a receiver
    // Filters for unique entries (as to not have entries duplicated
    // when the user is both a sender and receiver/a tranfser)
    // 
    let logEntries: UserLog[] = []
    await connect(mongoUri)
    try {        
        await UserLogModel.find({"discordId": discordId}).exec().then( async function(docs) {
            for (let doc in docs) {
                logEntries.push(docs[doc])
            }
        })
        await UserLogModel.find({"recipient": discordId}).exec().then( async function(docs) {
            for (let doc in docs) {
                logEntries.push(docs[doc])
            }
        })
        // logEntries = compareLogEntries( logEntries )
    }
    catch (err) {
        errorLogger("addLog Entry Failed: ", err)
    }
    finally {
        await disconnect()
    }
    return logEntries
}