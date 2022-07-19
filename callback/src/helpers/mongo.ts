import { connect, disconnect } from 'mongoose'
import { DiscordUserModel } from '../models/DiscordUserModel'
import { DiscordUser } from '../interfaces/DiscordUser'
import { errorHandler } from './logHandler'

const uri = process.env.MONGO_URI || "mongodb://" 
    + process.env.MONGO_HOST || "0.0.0.0"
    + ":" + process.env.MONGO_PORT || "28717"
    + "/test?retryWrites=true&w=majority"

interface mongoClient {
    uri: String
    getUser(state: string): Promise<DiscordUser>
}

export class MongoClient implements mongoClient {
    uri: String = uri || "No URI"

    public async getUser(state: string): Promise<DiscordUser> {
        // 
        // Takes the current state and returns the user it belongs to.
        // 
        let discordUser: DiscordUser = new DiscordUserModel()
        try {
            await connect(uri)

            // Declare the DiscordUser model and search mongodb for
            // a state that matches the callback value
            const findUser = await DiscordUserModel.findOne({ "state": String(state) })
            .exec().then(async function(doc) {
                if (doc) {
                    discordUser = doc
                }
            })

            await disconnect()
        }
        catch (err) {
            errorHandler("getUser", err)
        }
        return discordUser
    }
}