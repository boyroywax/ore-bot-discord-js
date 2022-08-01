import { connect, disconnect } from 'mongoose'

import { debugLogger, errorLogger } from '../utils/logHandler'
import { DiscordUserModel } from '../models/DiscordUserModel'
import { logEntry } from "./activityLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"
import { mongoUri } from '../utils/mongo'


export async function verifyLogin(
    userOreId: string,
    stateIn: string): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let loggedIn = false
    await connect(mongoUri)
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        await DiscordUserModel.findOne({ "state": String(stateIn) }).exec()
            .then(async function(doc) {
            // If the doc exists, set the loggedIn value to true
            // Reset the state to "None"
            if (doc) {
                doc.loggedIn = true
                doc.lastLogin = new Date
                doc.oreId = userOreId
                doc.state = "None"
                loggedIn = true

                await doc.save()

                const logArgs: UserLogKWArgs = { 
                    oreId: userOreId,
                    status: "Complete"
                } 
                await logEntry('Login', doc.discordId, logArgs)
            }
            else {
                await DiscordUserModel.findOne({ "oreId": userOreId })
                .exec().then(async function(doc) {
                    if (doc?.discordId) {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "User needs to request new /login"
                        } 
                        await logEntry('Login', doc?.discordId, logArgs)
                    }
                    else {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "Cannot verify discordID, This may be the users first time logging in."
                        } 
                        await logEntry('Login', BigInt(0), logArgs)
                    }
                })
            }
        })
    }
    catch (err) {
        errorLogger("verifyLogin", err)
    }
    finally {
        await disconnect()
    }
    return loggedIn
}