import { connect, disconnect, Model, model } from 'mongoose'
import { logHandler } from '../utils/logHandler'
import { DiscordUserModel, discordSchema } from '../models/DiscordUserModel'
import { DiscordUser } from '../interfaces/DiscordUser'


const uri = "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"

function setDiscordUser(
    userDiscordId: number,
    date?: Date,
    doc?: DiscordUser,
    oreId?: string,
    state?: string,
    userLoggedIn?: boolean
    ): DiscordUser {
    if (doc) {
        doc.lastLogin = date || doc.lastLogin
        doc.dateCreated = doc.dateCreated || date
        doc.loggedIn = userLoggedIn || doc.loggedIn
        doc.discordId = userDiscordId || doc.discordId
        doc.state = state || doc.state
        doc.oreId = oreId || doc.oreId
    }
    else {
        doc = new DiscordUserModel({
            dateCreated: date || new Date,
            discordId: userDiscordId || 0,
            loggedIn: userLoggedIn || false
        })
    } 
    return doc
}


export async function setDiscordUserState(
    userDiscordId: number,
    state: string,
    loggedIn?: boolean): Promise<boolean> {
    // 
    // Returns true if successfully
    // 
    // 
    const date = new Date
    let successful = false
    await connect(uri)
    try {
        
        const verification = await DiscordUserModel.findOne({ "discordId": userDiscordId })
        .exec().then(async function(doc) {
            logHandler.info("File found: " + doc)
            if (doc) {
                doc.discordId = doc.discordId || 0
                doc.state = state || "None"
                doc.lastLogin = doc.lastLogin || date,
                doc.dateCreated = doc.dateCreated || date,
                doc.loggedIn = loggedIn || false

                let saveUser = await doc.save()
                logHandler.info('Saved the doc to mongodb: ' + saveUser)
                successful = true
            }
            else {
                let doc = setDiscordUser(
                    userDiscordId,
                    date,
                    undefined,
                    undefined,
                    undefined,
                    false
                ) 
                await DiscordUserModel.create(doc)
            }
        })    
    }
    catch (error) {
        logHandler.error(error)
    }
    await disconnect()
    return successful
}

export async function checkLoggedIn(
    userDiscordId: number
    ): Promise<[ boolean, string ]> {
    // 
    // Returns the users login status
    // 
    await connect(uri)
    let loggedIn: boolean = false
    let lastLogin: string = "Never"
    // let DiscordUser = model('DiscordUser', discordSchema)
    const currentDate: Date = new Date
    const verification = await DiscordUserModel.findOne({ "discordId": userDiscordId })
    .exec().then(async function(doc) {
        logHandler.info('then verification: ' + doc)
        if (doc) {
            loggedIn = doc.loggedIn
            lastLogin = doc.lastLogin?.toString() || "Never"
        }
        else {
            loggedIn = false
            let doc = setDiscordUser(
                userDiscordId,
                currentDate
            )
            await DiscordUserModel.create(doc)
        }
        
    })
    await disconnect()
    return [ loggedIn, lastLogin ]
}