import { connect, disconnect } from 'mongoose'

import { errorLogger, eventLogger } from '../utils/logHandler'
import { DiscordUserModel } from '../models/DiscordUserModel'
import { logEntry } from "./activityLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"
import { mongoUri } from '../utils/mongo'


export async function loginError(
    errorMsg: string,
    stateIn: string): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let errorLogged = false

    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        if ( stateIn !== "0" ) {
            await DiscordUserModel.findOne({ "state": String(stateIn) })
            .exec().then(async function(doc) {
                // If the doc exists, set the loggedIn value to true
                // Reset the state to "None"
                if (doc) {
                    doc.loggedIn = false
                    doc.oreId = "None"
                    doc.state = "None"
                    errorLogged = true

                    await doc.save()

                    const logArgs: UserLogKWArgs = { 
                        status: "Failed",
                        comment: errorMsg.replace(/_+/g, ' ')
                    } 
                    await logEntry('Login', doc.discordId, logArgs)
                }
                else {
                    const logArgsError: UserLogKWArgs = {
                        status: "Failed",
                        comment: `State not found in DB: ${stateIn}`
                    }
                    errorLogger("logoutError/findOne", ({message: "State not found.  Please try logging in again using /login command on the ORE Network Bot in Discord."} as Error))
                }
            })
        }
        else {
            eventLogger({message: "Login not initated by the bot. Ignoring..."})
        }
    }
    catch (err) {
        errorLogger("verifyLogin", err)
    }

    return errorLogged
}