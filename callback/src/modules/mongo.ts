import { connect, Connection, disconnect, model } from 'mongoose'
import { logHandler } from '../utils/logHandler'
import { OreIdUserModel, oreIdSchema } from '../models/oreIdUserModel'

let database: Connection;
const uri = "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"


export async function verifyLogin(
    userOreId: string,
    stateIn: string): Promise<void> {

    try {
        await connect(uri);
        logHandler.info('Connected to MongoDB!')
        // const filter = {
        //     state: state
        // }
        const OreIdUser = model('OreIdUser', oreIdSchema)
        const verification = await OreIdUser.findOneAndDelete({ "state": stateIn }).exec().then(async function(doc) {
            logHandler.info('then verification: ' + doc)
            const userDiscordId: number = doc?.discordId || 0

            if (userDiscordId === 0) {
                logHandler.error(userOreId + ' attempted an unverified login')
            }
            else {
                const updatedDoc = new OreIdUserModel({
                    oreId: userOreId,
                    discordId: userDiscordId,
                    lastLogin: Date.now(),
                    loggedIn: true,
                    // state: stateIn
                });
                const saveDoc = await updatedDoc.save()
                logHandler.info('Saved the doc to mongodb: ' + saveDoc)
            }
        })
        // const doc = await verification.exec()
        // logHandler.info('verification: ' + verification)
        // logHandler.info('doc: ' + doc)
        
        await disconnect()
    }
    catch (error) {
        logHandler.error(error)
    }
}