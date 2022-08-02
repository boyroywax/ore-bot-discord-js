
import { connect, disconnect, model } from 'mongoose'

import { mongoUri } from '../utils/mongo'
import { debugLogger, errorLogger } from '../utils/logHandler'
import { DiscordUserModel, UserLogModel } from '../models/DiscordUserModel'
import { logEntry } from "./activityLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"

export async function verifyLogout( stateIn: string ): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let logoutSuccess: boolean = false
    const db = await connect(mongoUri)
    // Connect to mongoDB
    debugLogger('Connected to MongoDB!')
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        debugLogger("Finding: " + stateIn)
        // const OreIdUser = model('OreIdUser', discordSchema)
        await DiscordUserModel.findOne({ "state": String(stateIn) })
            .exec().then(async function(doc) {
                debugLogger('document fetched: ' + doc)
                // If the doc exists, set the loggedIn value to false
                // Also reset the state to "None"
                if (doc) {
                    doc.loggedIn = false
                    doc.oreId = "None"
                    doc.state = "None"
                    logoutSuccess = true

                    let saveUser = await doc.save()
                    debugLogger('Saved the doc to mongodb: ' + saveUser)

                    const logArgs: UserLogKWArgs = { 
                        status: "Complete"
                    } 
                    await logEntry('LogOut', doc.discordId, logArgs)
                }
                else {
                    const logArgs: UserLogKWArgs = {
                        status: "Failed",
                        comment: "Cannot verify discordID."
                    } 
                    await logEntry('LogOut', BigInt(0), logArgs)
                    errorLogger('verifyLogout', ({message: "Cannot verify state in DB"} as Error))
                }
            })
            .catch((error) => {
                errorLogger("DiscordModel.findOne", error)
            })
    }
    catch (error) {
        errorLogger("verifyLogout", error)
    }
    await db.disconnect()
    return logoutSuccess
}