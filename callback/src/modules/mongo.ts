import { connect, disconnect, model } from 'mongoose'
import { logHandler } from '../utils/logHandler'
import { DiscordUserModel, discordSchema } from '../models/discordUserModel'


const uri = "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"


export async function verifyLogin(
    userOreId: string,
    stateIn: string): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let loggedIn = false
    await connect(uri)
    // Connect to mongoDB
    logHandler.info('Connected to MongoDB!')
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        logHandler.info("Finding: " + stateIn)
        const OreIdUser = model('OreIdUser', discordSchema)
        const findUser = await OreIdUser.findOne({ "state": String(stateIn) })
        .exec().then(async function(doc) {
            logHandler.info('document fetched: ' + doc)
            // If the doc exists, set the loggedIn value to true
            if (doc) {
                doc.loggedIn = true
                doc.lastLogin = new Date
                doc.oreId = userOreId
                doc.state = "None"
                loggedIn = true

                let saveUser = await doc.save()
                logHandler.info('Saved the doc to mongodb: ' + saveUser)
            }
            else {
                logHandler.error('verifyLogin failed')
            }
        })
    }
    catch (error) {
        logHandler.error("Error verifying login: " + error)
    }
    await disconnect()
    return loggedIn
}
