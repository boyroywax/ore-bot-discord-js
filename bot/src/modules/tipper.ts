import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { BotBalanceModel } from '../models/DiscordUserModel'
import { BotBalance } from '../interfaces/DiscordUser'
import { connect, disconnect } from 'mongoose'
import { checkLoggedIn, updateBotBalance, zeroBotBalance } from './mongo'

const uri = process.env.MONGO_URI || "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"

function precisionRound(number: number, precision: number) {
    const factor = Math.pow(10, precision)
    const n = precision < 0 ? number : 0.01 / factor + number
    return Math.round( n * factor) / factor;
    }

export async function getBotBalance( userDiscordId: number): Promise<number> {
    // 
    // Retrieves the user's balance in the user's bot account
    // Creates a botBalance entry for the user if they do not have one
    // 
    await connect(uri)
    let botBalance: number = 0.00
    try {
        const userInfo = await BotBalanceModel.findOne({"discordId": userDiscordId})
        if (userInfo) {
            botBalance = userInfo.botBalance
        }
        else {
            const zeroCompleted: boolean = await zeroBotBalance(userDiscordId)
            if (zeroCompleted) {
                logHandler.info('Successfully zeroed ' + userDiscordId + " botBalance")
            }
        }

    }
    catch(err) {
        errorHandler('getBotBalance failed: ', err)
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
        // Creates an entry in botBalance if none exists
        let fromUserBalance: number = await getBotBalance(fromUser)
        let recipientBalance: number = await getBotBalance(recipient)

        // CHeck that the fromUser has adequate funds
        if (amount == 0.00) {
            tipCompleted = false
            tipStatus = "You cannot tip 0.00 " + process.env.CURRENCY_TOKEN
        }
        else if (amount <= 0.00) {
            tipCompleted = false
            tipStatus = "You cannot tip less than 0.00 " + process.env.CURRENCY_TOKEN
        }
        else if (amount <= fromUserBalance) {
            // Adjust the balances
            fromUserBalance = precisionRound( fromUserBalance - amount, Number(process.env.CURRENCY_PRECISION) || 8 )
            recipientBalance = precisionRound( recipientBalance + amount, Number(process.env.CURRENCY_PRECISION) || 8 )
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

export async function adminTip( recipient: number, amount: number ): Promise<[ boolean, string ]> {
    // 
    // Creates tokens and adds them to an account
    // Checks that the sendUser has adequate funds
    // Returns tipCompleted, and tipStatus
    // 
    await connect(uri)
    let tipCompleted: boolean = false
    let tipStatus: string = "Tip Initiated"
    try {
        // Retrive both users balances
        // Creates an entry in botBalance if none exists
        // let fromUserBalance: number = await getBotBalance(fromUser)
        let recipientBalance: number = await getBotBalance(recipient)

        // CHeck that the fromUser has adequate funds
        if (amount == 0.00) {
            tipCompleted = false
            tipStatus = "You cannot tip 0.00 " + process.env.CURRENCY_TOKEN
        }
        else if (amount <= 0.00) {
            tipCompleted = false
            tipStatus = "You cannot tip less than 0.00 " + process.env.CURRENCY_TOKEN
        }
        else {
            // Adjust the balances
            // fromUserBalance -= amount
            recipientBalance += amount
            logHandler.info("new balances: " + recipientBalance)

            // Write the changed balances to mongo
            // const fromUserUpdate = await updateBotBalance( fromUser, fromUserBalance )
            const recipientUpdate = await updateBotBalance( recipient, recipientBalance )

            if (recipientUpdate) {
                tipCompleted = true
                tipStatus = "adminTip Completed"
            }
            else {
                tipStatus = "adminTip Failed"
            }
        }
    }
    catch (err) {
        errorHandler("adminTip failed: ", err)
    }
    await disconnect()
    return [ tipCompleted, tipStatus ]
}