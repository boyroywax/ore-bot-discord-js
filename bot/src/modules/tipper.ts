import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { BotBalanceModel } from '../models/DiscordUserModel'
import { BotBalance } from '../interfaces/DiscordUser'
import { connect, disconnect } from 'mongoose'
import { updateBotBalance } from './mongo'


const uri = process.env.MONGO_URI || "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"

export async function getBalance( userDiscordId: number): Promise<number> {
    await connect(uri)
    let botBalance: number = 0.00
    try {
        const userInfo = await BotBalanceModel.findOne({"discordId": userDiscordId})
        botBalance = userInfo?.botBalance || 0.00
    }
    catch(err) {
        errorHandler('getBalance failed: ', err)
    }
    await disconnect()
    return botBalance
}

export async function doTip( fromUser: number, recipient: number, amount: number ): Promise<[ boolean, string ]> {
    // 
    // Attempts to complete a tip transaction
    // Checks that the sendUser has adequate funds
    // Returns tipCompleted, and tipStatus
    // 
    await connect(uri)
    let tipCompleted: boolean = false
    let tipStatus: string = "Tip Initiated"
    try {
        // Retrive both users balances
        let fromUserBalance: number = await getBalance(fromUser)
        let recipientBalance: number = await getBalance(recipient)

        // CHeck that the fromUser has adequate funds
        if (amount <= fromUserBalance) {
            // Adjust the balances
            fromUserBalance -= amount
            recipientBalance += amount
            logHandler.info("new balances: " + fromUserBalance + " " + recipientBalance)

            // Write the changed balances to mongo
            const fromUserUpdate = await updateBotBalance( fromUser, fromUserBalance )
            const recipientUpdate = await updateBotBalance( recipient, recipientBalance )

            if (fromUserUpdate && recipientUpdate) {
                tipCompleted = true
                tipStatus = "Tip Completed"
            }
            else {
                tipStatus = "Tip Failed"
            }
        }
        else {
            tipStatus = "User does not have adequate funds!"
        }
    }
    catch (err) {
        errorHandler("doTip failed: ", err)
    }
    await disconnect()
    return [ tipCompleted, tipStatus ]
}