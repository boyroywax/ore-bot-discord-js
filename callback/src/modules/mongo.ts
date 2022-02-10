import { connect, Connection, disconnect } from 'mongoose'
import { logHandler } from '../utils/logHandler'
import { OreIdUserModel } from '../models/oreIdUserModel'

let database: Connection;
const uri = "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"


export async function verifyLogin(
    userOreId: string,
    state: string): Promise<void> {

    try {
        await connect(uri);
        logHandler.info('Connected to MongoDB!')
        const filter = {
            state: state
        }
        const verification = await OreIdUserModel.findOneAndDelete(filter)
        logHandler.info('verification: ' + verification)
        const userDiscordId: number = verification?.discordId || 0

        if (userDiscordId === 0) {
            logHandler.error(userOreId + ' attempted an unverified login')
        }
        else {
            const doc = new OreIdUserModel({
                oreId: userOreId,
                discordId: userDiscordId,
                lastLogin: Date.now(),
                loggedIn: true,
                state: state
            });
            await doc.save()
            logHandler.info('Saved the doc to mongodb: ' + doc)
        }
        await disconnect()
    }
    catch (error) {
        logHandler.error(error)
    }


}