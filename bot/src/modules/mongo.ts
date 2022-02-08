import { connect, Schema, model, Connection, connection, disconnect } from 'mongoose'
import { logHandler } from '../utils/logHandler'

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

export async function stop() {
  if (!database) {
    return
  }
  await disconnect()
}

export async function demo() {

    // 1. Create an interface representing a document in MongoDB.
    interface User {
    name: string;
    email: string;
    avatar?: string;
    }

    // 2. Create a Schema corresponding to the document interface.
    const schema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: String
    });

    // 3. Create a Model.
    const UserModel = model<User>('User', schema);

    run().catch(err => logHandler.error(err));

    async function run(): Promise<void> {
        // 4. Connect to MongoDB
        try {
            await connect(uri);
            logHandler.info('Connected to MongoDB!')
        }
        catch (error) {
            logHandler.error(error)
        }

        const doc = new UserModel({
            name: 'Bill',
            email: 'bill@initech.com',
            avatar: 'https://i.imgur.com/dM7Thhn.png'
        });
        await doc.save();

        logHandler.info(doc.email); // 'bill@initech.com'
    }
}