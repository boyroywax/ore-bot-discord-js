
import { connect, disconnect } from 'mongoose'

import { UserLog, UserLogKWArgs } from '../interfaces/DiscordUser'
import { UserLogModel } from '../models/DiscordUserModel'
import { debugLogger, errorLogger } from "../utils/logHandler"
import { mongoUri } from '../utils/mongo'


async function getTips( discordId: bigint, min: number, limit: number ): Promise<UserLog[]> {
    // 
    // Fetches a UserLog list, including activity as a receiver
    // Filters for unique entries (as to not have entries duplicated
    // when the user is both a sender and receiver/a tranfser)
    // 
    let tips: UserLog[] = []

    try {
        const db = await connect(mongoUri)
        await UserLogModel.find({"discordId": discordId, "action": "Tip"})
            .sort("-date")
            .limit(limit).skip(min).exec()
            .then( async function(docs) {
                for (let doc in docs) {
                    tips.push(docs[doc])
                }
                await db.disconnect()
            })
    }
    catch (err) {
        errorLogger("getTips discordId", err)
    }


    try {
        const db = await connect(mongoUri)
        await UserLogModel.find({"recipient": discordId, "action": "Tip"})
            .sort("-date")
            .limit(limit).skip(min).exec()
            .then( async function(docs) {
                for (let doc in docs) {
                    tips.push(docs[doc])
                }
                await db.disconnect()
            })
    }
    catch (err) {
        errorLogger("getTips recipient", err)
    }
    finally {

    }
    return tips
}

export async function listLastTips ( discordId: bigint, min: number = 0, limit: number = 20 ): Promise<UserLog[]> {
    // 
    // Returns a list of logEntries for a user
    // Sorted in descending date order
    // Leaves only uniqe values
    // 
    let userTips: UserLog[] = []
    try {
        userTips = await getTips(discordId, min, limit)
        let sortedTips = userTips.sort((a: UserLog ,b: UserLog) => +new Date(b.date) - +new Date(a.date))
        
        // create a new list with only unique entries
        let uniqueTips = [sortedTips[0]];
        for (let i = 1; i < sortedTips.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if (sortedTips[i-1].date.toString() != sortedTips[i].date.toString()) {
                debugLogger(JSON.stringify(sortedTips[i]))
                uniqueTips.push(sortedTips[i]);
            }
        }
        userTips = uniqueTips
    }
    catch (err) {
        errorLogger("listLastTips in userLog.ts", err)
    }
    return userTips
}

export async function getTotalTips ( discordId: bigint ): Promise<{result: number}> {
    // 
    // Returns a list of completed tips for a user
    // Sorted in descending date order
    // Leaves only uniqe values
    // 
    let userTips: UserLog[] = []
    let totalTips: number = 0
    try {
        userTips = await getTips(discordId, 0, 200000)
        let sortedTips = userTips.sort((a: UserLog ,b: UserLog) => +new Date(b.date) - +new Date(a.date))
        
        // create a new list with only unique entries
        let uniqueTips = [sortedTips[0]];
        for (let i = 1; i < sortedTips.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if ((sortedTips[i-1].date.toString() != sortedTips[i].date.toString()) && (sortedTips[i-1].status === "Complete")) {
                debugLogger(JSON.stringify(sortedTips[i]))
                uniqueTips.push(sortedTips[i]);
            }
        }
        totalTips = uniqueTips.length - 1
    }
    catch (err) {
        errorLogger("listtotalTips in userLog.ts", err)
    }
    return {result: totalTips}
}