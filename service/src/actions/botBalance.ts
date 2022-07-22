import { connect, disconnect } from 'mongoose'

import { BotBalanceModel } from '../models/DiscordUserModel'
import { debugLogger, errorLogger } from '../utils/logHandler'
import { mongoUri } from 'utils/mongo'


export async function getBotBalance( userDiscordId: bigint ): Promise<number> {
    // 
    // Retrieves the user's balance in the user's bot account
    // Creates a botBalance entry for the user if they do not have one
    // 
    await connect(mongoUri)
    let botBalance: number = 0.00
    try {
        const userInfo = await BotBalanceModel.findOne({"discordId": userDiscordId})
        if (userInfo) {
            botBalance = userInfo.botBalance
        }
        else {
            const zeroCompleted: boolean = await zeroBotBalance(userDiscordId)
            if (zeroCompleted) {
                debugLogger('Successfully zeroed ' + userDiscordId + " botBalance")
            }
        }
    }
    catch(err) {
        errorLogger('getBotBalance failed: ', err)
    }
    finally {
        await disconnect()
    }
    return botBalance
}

export async function zeroBotBalance ( userDiscordId: bigint ): Promise<boolean> {
    // 
    // Sets a user's bot balance back to zero, used when creating a new user.
    // 
    let balanceZeroed = false
    await connect(mongoUri)
    try {
        const updateOutput = await BotBalanceModel.findOne({ "discordId": userDiscordId })
            .exec()
            .then( async function(doc) {
                if (!doc) {
                    // Generate a BotBalance for the user
                    const botBalanceDoc = new BotBalanceModel
                    botBalanceDoc.discordId = userDiscordId
                    botBalanceDoc.botBalance = 0.0
                    botBalanceDoc.botToken = process.env.CURRENCY_TOKEN || "ORE"
                    await botBalanceDoc.save()
                    balanceZeroed = true
                }
                else {
                    doc.botBalance = 0.0
                    await doc.save()
                    balanceZeroed = true
                }
            })
    }
    catch (err) {
        errorLogger("zeroBotBalance", err)
    }
    finally {
        await disconnect()
    }
    return balanceZeroed
}