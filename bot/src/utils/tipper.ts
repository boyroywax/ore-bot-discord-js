import { connect, disconnect } from 'mongoose'

import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { BotBalanceModel, UserLogModel } from '../models/DiscordUserModel'
import { BotBalance, DiscordUser, UserLog } from '../interfaces/DiscordUser'
import { checkLoggedIn, updateBotBalance, zeroBotBalance } from './mongo'
import { listActivity } from './userLog'

const dripTimeLimit: number = Number(process.env.BOT_FAUCET_TIME_LIMIT) || Number(3 * 60 * 60 * 1000)
const faucetUser = BigInt(process.env.BOT_FAUCET_USER || BigInt("000000000000000099"))
const uri = process.env.MONGO_URI || "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"

export function precisionRound(number: number, precision: number): number {
    const factor = Math.pow(10, precision)
    const n = precision < 0 ? number : 0.01 / factor + number
    return Math.round( n * factor ) / factor;
    }

function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
    }

export async function getBotBalance( userDiscordId: bigint ): Promise<number> {
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

export async function doTip( fromUser: bigint, recipient: bigint, amount: number ): Promise<[ boolean, string ]> {
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

        if (recipient == BigInt(process.env.DISCORD_CLIENT_ID || "936064780081434737") ) {
            tipCompleted = false
            tipStatus = "You cannot tip the ORE Network Bot"
        }
        // Check that the amount being tipped is not zero
        else if (amount == 0.00) {
            tipCompleted = false
            tipStatus = "You cannot tip 0.00 " + process.env.CURRENCY_TOKEN
        }
        // Check that the amount is greater than zero
        else if (amount < 0.00) {
            tipCompleted = false
            tipStatus = "You cannot tip less than 0.00 " + process.env.CURRENCY_TOKEN
        }
        // Check that the user is not sending funds to themselves
        else if (fromUser == recipient) {
            tipCompleted = false
            tipStatus = "You cannot tip yourself!"
        }
        // CHeck that the fromUser has adequate funds
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
            tipStatus = "You cannot tip more tokens than you own!"
        }
    }
    catch (err) {
        errorHandler("doTip failed: ", err)
    }
    await disconnect()
    return [ tipCompleted, tipStatus ]
}

async function checkLastDrip( recipient: bigint ): Promise<Date> {
    let lastDripDate: Date = new Date(0)
    try {
        const logEntries = await listActivity(recipient)
        for (let entry in logEntries) {
            let parseEntry: UserLog = new UserLogModel(logEntries[entry])
            if (parseEntry.action == "FaucetDrip" && parseEntry.status == "Complete") {
                if (parseEntry.date >= lastDripDate) {
                    lastDripDate = parseEntry.date
                }
            }
        }
    }
    catch (err) {
        errorHandler("checkLastDrip failed", err)
    }
    return lastDripDate
}

export async function faucetDrip( recipient: bigint ): Promise<[ boolean, number, string ]> {
    await connect(uri)
    let dripCompleted: boolean = false
    let dripAmount: number = 0.00
    let dripComment: string = "Faucet drip initated."
    try {
        // Check the user's lastDrip time to make sure they are eligable
        const lastDripDate: Date = await checkLastDrip(recipient)
        logHandler.info('lastDripDate: ' + lastDripDate.valueOf())

        const dripTimeWaiting: number = Date.now() - lastDripDate.valueOf()
        logHandler.info("dripTimeWaiting: " + dripTimeWaiting)

        const timeLimit: number = lastDripDate.valueOf() + dripTimeLimit
        logHandler.info("timeLimit: " + timeLimit)

        logHandler.info("dripTimeLimit: " + dripTimeLimit)

        if (dripTimeWaiting >= dripTimeLimit) {
            // Retrive the user's botBalance
            // Creates an entry in botBalance if none exists
            let recipientBalance: number = await getBotBalance(recipient)

            // Retreive the bot's faucet balance
            // Creates a faucet balance if one does not exist
            let faucetBalance: number = await getBotBalance( faucetUser )

            // Generate a random number from Faucet MIN and MAX
            dripAmount = precisionRound(getRandomArbitrary(
                Number(process.env.BOT_FAUCET_MIN) || 0.01,
                Number(process.env.BOT_FAUCET_MAX) || 0.10
                ), Number(process.env.CURRENCY_PRECISION) || 8
            )

            // Check that the faucet has enough balance
            if (dripAmount <= faucetBalance) {
                // Adjust the balances
                faucetBalance -= dripAmount
                recipientBalance += dripAmount
                logHandler.info("new balances: " + recipientBalance)

                // Write the changed balances to mongo
                const fromUserUpdate = await updateBotBalance( faucetUser, faucetBalance )
                const recipientUpdate = await updateBotBalance( recipient, recipientBalance )

                if (recipientUpdate && fromUserUpdate) {
                    dripCompleted = true
                    dripComment = dripAmount + " " + process.env.CURRENCY + " dripped to user."
                }
                else {
                    dripComment = "Failed adding the faucet drip to the database."
                }
            }
            else {
                dripComment = "The faucet does not have enough tokens to complete the drip."
            }
        }
        else {
            const msecsToNextDrip: number = dripTimeLimit - dripTimeWaiting
            const minsToNextDrip: number = msecsToNextDrip / (1000 * 60)
            dripComment = "You must wait " + precisionRound(minsToNextDrip, 1) + " minutes before you can claim the faucet again."
        }
    }
    catch (err) {
        errorHandler("faucetDrip failed: ", err)
    }
    await disconnect()
    return [ dripCompleted, dripAmount, dripComment ]
}

export async function faucetDonate ( amount: number, donor: bigint ): Promise<[ boolean, string, number ]> {
    let donationCompleted: boolean = false
    let donationComment: string = "Faucet Donation from " + donor + " for "+ amount + " initiated"
    let donationFundTotal: number = await getBotBalance(faucetUser)
    try {
        const [ donationComplete, donationStatus ] = await doTip( donor, faucetUser, amount)
        
        if ( donationComplete ) {
            donationCompleted = true
            donationComment =  "Faucet donation from " + donor + " for "+ amount + " succeeded"
            donationFundTotal += amount
        }
        else {
            donationComment = donationStatus
        }
    }
    catch (err) {
        errorHandler('faucetDonate failed', err)
    }
    return [ donationCompleted, donationComment, donationFundTotal ]
}
