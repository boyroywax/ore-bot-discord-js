
import { connect, disconnect, model } from 'mongoose'

import { mongoUri } from '../utils/mongo'
import { debugLogger, errorLogger } from '../utils/logHandler'
import { UserLog } from '../interfaces/DiscordUser'
import { DiscordUserModel, UserLogModel } from '../models/DiscordUserModel'
import { addLogEntry } from "./activityLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"

export async function verifyLogout( stateIn: string ): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let logoutSuccess: boolean = false
    await connect(mongoUri)
    // Connect to mongoDB
    debugLogger('Connected to MongoDB!')
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        debugLogger("Finding: " + stateIn)
        // const OreIdUser = model('OreIdUser', discordSchema)
        const findUser = await DiscordUserModel.findOne({ "state": String(stateIn) })
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
                await addLogEntry('LogOut', doc.discordId, logArgs)
            }
            else {
                const logArgs: UserLogKWArgs = {
                    status: "Failed",
                    comment: "Cannot verify discordID."
                } 
                await addLogEntry('LogOut', BigInt(0), logArgs)
                errorLogger('verifyLogout', "error" )
            }
        })
    }
    catch (error) {
        errorLogger("verifyLogout", error)
    }
    await disconnect()
    return logoutSuccess
}