import { connect, disconnect, FilterQuery, Model, model, Schema } from 'mongoose'
import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { DiscordUserModel, BotBalanceModel } from '../models/DiscordUserModel'
import { BotBalance, DiscordUser } from '../interfaces/DiscordUser'


const uri = process.env.MONGO_URI || "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"

function setDiscordUser(
    // 
    // Returns a DiscordUser object
    // creates a new discordUser if one does not exist
    // 
    userDiscordId: number,
    date?: Date,
    doc?: DiscordUser,
    oreId?: string,
    state?: string,
    userLoggedIn?: boolean
    ): DiscordUser {
    if (doc) {
        if (doc.lastLogin) { 
           doc.lastLogin = date
        }
        else {
            doc.lastLogin = undefined
        }
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
    // Returns true if successfully set user state in mongodb
    // Creates a new user record if the discordId does not exist
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
                if (loggedIn) {
                    doc.lastLogin = doc.lastLogin || date
                }
                else {
                    doc.lastLogin = doc.lastLogin || undefined
                }
                doc.dateCreated = doc.dateCreated || date
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
    // Returns the users login status and lastLogin Date in string form
    // Creastes a new user if one does not exist
    // 
    await connect(uri)
    let loggedIn: boolean = false
    let lastLogin: string = "Never"
    const currentDate: Date = new Date

    // Find the users mongodb doc by discordId
    const verification = await DiscordUserModel.findOne({ "discordId": userDiscordId })
    .exec().then(async function(doc) {
        logHandler.info('then verification: ' + doc)
        // Get the users last login date as a string
        if (doc) {
            loggedIn = doc.loggedIn
            if (doc.lastLogin?.toString()) {
                lastLogin = doc.lastLogin?.toString() || "Never"
            }
        }
        // Create the user if they do not exist
        else {
            loggedIn = false
            let doc: DiscordUser = setDiscordUser(
                userDiscordId,
                currentDate
            )
            await DiscordUserModel.create(doc)
        }
        
    })
    await disconnect()
    return [ loggedIn, lastLogin ]
}

export async function getOreIdUser( userDiscordId: number): Promise<string> {
    // 
    // Fetches a user's oreID when passed in a discordId
    // 
    let oreId: string = "None"
    await connect(uri)
    try {
        const oreIdUser = await DiscordUserModel.findOne({ "discordId": userDiscordId })
        .exec().then(async function(doc) {
            if (doc) {
                oreId = doc.oreId || "None"
            }  
        })
    } catch (err) {
        errorHandler("getOreIdUser failed: ", err)
    }
    await disconnect()
    return oreId
}

export async function zeroBotBalance ( userDiscordId: number ): Promise<boolean> {
    // 
    // Sets a user's bot balance back to zero, used when
    // creating a new user.
    // 
    let balanceZeroed = false
    await connect(uri)
    try {
        const updateOutput = await BotBalanceModel.findOne({ "discordId": userDiscordId }).exec().then( async function(doc) {
            if (!doc) {
                // Generate a BotBalance for the user
                const botBalanceDoc = new BotBalanceModel
                botBalanceDoc.discordId = userDiscordId
                botBalanceDoc.botBalance = 0.0
                botBalanceDoc.botToken = process.env.CURRENCY_TOKEN || "ORE"
                await botBalanceDoc.save()
                balanceZeroed = true
            }
            else {
                doc.botBalance = 0.0
                await doc.save()
                balanceZeroed = true
            }
        })
    }
    catch (err) {
        errorHandler("zeroBotBalance failed: ", err)
    }
    await disconnect()
    return balanceZeroed
}

export async function updateBotBalance( userDiscordId: number, botBalance: number ): Promise<boolean> {
    let saveStatus: boolean = false
    await connect(uri)
    try {        
        const updateOutput = await BotBalanceModel.findOne({ "discordId": userDiscordId }).exec().then( async function(doc) {
            if (doc) {
                doc.botBalance = botBalance
                await doc.save()
                saveStatus = true
            }
        })
    }
    catch (err) {
        errorHandler("updateBotBalance Failed: ", err)
    }
    await disconnect()
    return saveStatus
}