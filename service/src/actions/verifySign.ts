import { connect, disconnect } from 'mongoose'

import { errorLogger } from '../utils/logHandler'
import { DiscordUserModel, BotBalanceModel} from '../models/DiscordUserModel'
import { addLogEntry } from "./activityLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"
import { mongoUri } from '../utils/mongo'


export async function verifySign(
    userOreId: string,
    stateIn: string): Promise<boolean> {
    //
    // Validate a signed transaction
    // Returns true if the user was logged in correctly
    //
    let signed = false
    await connect(mongoUri)
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        await DiscordUserModel.findOne({ "state": String(stateIn) })
        .exec().then(async function(doc) {
            // If the doc exists, set the loggedIn value to true
            // Reset the state to "None"
            if (doc) {
                doc.loggedIn = true
                doc.oreId = userOreId
                doc.state = "None"
                signed = true

                await doc.save()

                // increment the users bot balance
                await BotBalanceModel.findOne({"discordId": doc.discordId}).exec().then( async function(balanceDoc){
                    if (balanceDoc) {
                        balanceDoc.botBalance = balanceDoc.botBalance + (doc.pendingTransaction  || 0.00)
                        await balanceDoc.save()
                    }
                })

                const logArgs: UserLogKWArgs = { 
                    oreId: userOreId,
                    status: "Complete"
                } 
                await addLogEntry('Transfer', doc.discordId, logArgs)
            }
            else {
                await DiscordUserModel.findOne({ "oreId": userOreId })
                .exec().then(async function(doc) {
                    if (doc?.discordId) {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "Cannot Find ORE-ID User, please request a new /transfer"
                        } 
                        await addLogEntry('Transfer', doc?.discordId, logArgs)
                    }
                    else {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "Cannot verify discordID, This may be the users first time logging in."
                        } 
                        await addLogEntry('Transfer', BigInt(0), logArgs)
                    }
                })
            }
        })
    }
    catch (err) {
        errorLogger("verifySign", err)
    }
    finally {
        await disconnect()
    }
    return signed
}