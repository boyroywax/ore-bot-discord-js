import { connect, disconnect } from 'mongoose'

import { ActiveBalanceModel } from '../models/DiscordUserModel'
import { debugLogger, errorLogger } from '../utils/logHandler'
import { mongoUri } from '../utils/mongo'


export async function getActiveBalance( userDiscordId: bigint ): Promise<number> {
    // 
    // Retrieves the user's balance in the user's bot account
    // Creates a botBalance entry for the user if they do not have one
    // 
    await connect(mongoUri)
    let activeBalance: number = 0.00
    try {
        const userInfo = await ActiveBalanceModel.findOne({"discordId": userDiscordId})
        if (userInfo) {
            activeBalance = userInfo.activeBalance
        }
        else {
            const zeroCompleted: boolean = await zeroActiveBalance(userDiscordId)
            if (zeroCompleted) {
                debugLogger('Successfully zeroed ' + userDiscordId + " botBalance")
            }
        }
    }
    catch(err) {
        errorLogger('getActiveBalance failed: ', err)
    }
    finally {
        await disconnect()
    }
    return activeBalance
}

export async function zeroActiveBalance ( userDiscordId: bigint ): Promise<boolean> {
    // 
    // Sets a user's bot balance back to zero, used when creating a new user.
    // 
    let balanceZeroed = false
    await connect(mongoUri)
    try {
        const updateOutput = await ActiveBalanceModel.findOne({ "discordId": userDiscordId })
            .exec()
            .then( async function(doc) {
                if (!doc) {
                    // Generate a ActiveBalance for the user
                    const activeBalanceDoc = new ActiveBalanceModel
                    activeBalanceDoc.discordId = userDiscordId
                    activeBalanceDoc.activeBalance = 0.0
                    activeBalanceDoc.activeToken = process.env.CURRENCY_TOKEN || "ORE"
                    await activeBalanceDoc.save()
                    balanceZeroed = true
                }
                else {
                    doc.activeBalance = 0.0
                    await doc.save()
                    balanceZeroed = true
                }
            })
    }
    catch (err) {
        errorLogger("zeroActiveBalance", err)
    }
    finally {
        await disconnect()
    }
    return balanceZeroed
}