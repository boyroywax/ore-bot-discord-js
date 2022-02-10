import { connect, Schema, model, Connection, connection, disconnect } from 'mongoose'
import { logHandler } from '../utils/logHandler'

import { OreIdUserModel } from '../utils/stateCall'

let database: Connection;
const uri = "mongodb://" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/test?retryWrites=true&w=majority";


// export async function run() {
  
//   if (database) {
//     return;
//   }

//   await connect(uri)
//   database = connection
//   database.once("open", async () => {
//     logHandler.info("Connected to database");
//   });
//   database.on("error", () => {
//     logHandler.error("Error connecting to database")
//   })
// }

// export async function stop() {
//   if (!database) {
//     return
//   }
//   await disconnect()
// }

export async function setOreIdUser(
    userDiscordId: string,
    state: string): Promise<void> {

    try {
        await connect(uri);
        logHandler.info('Connected to MongoDB!')
        const doc = new OreIdUserModel({
            discordId: userDiscordId,
            state: state
        });
        await doc.save()
        logHandler.info('Saved the doc to mongodb')
        await disconnect()
    }
    catch (error) {
        logHandler.error(error)
    }
    // logHandler.info(doc.email); // 'bill@initech.com'
}