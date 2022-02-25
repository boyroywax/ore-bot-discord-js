import { connect, disconnect } from 'mongoose'

import { DiscordUser, UserLog } from '../interfaces/DiscordUser'
import { DiscordUserModel, BotBalanceModel, UserLogModel } from '../models/DiscordUserModel'
import { errorHandler } from '../utils/errorHandler'
import { logHandler } from '../utils/logHandler'


const uri = process.env.MONGO_URI || "mongodb://" 
    + process.env.MONGO_HOST 
    + ":" + process.env.MONGO_PORT 
    + "/test?retryWrites=true&w=majority"

function setDiscordUser(
    userDiscordId: bigint,
    date?: Date,
    doc?: DiscordUser,
    oreId?: string,
    state?: string,
    userLoggedIn?: boolean
    ): DiscordUser {
    // 
    // Returns a DiscordUser object
    // creates a new discordUser if one does not exist
    // 
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
            discordId: userDiscordId || BigInt(0),
            loggedIn: userLoggedIn || false
        })
    } 
    return doc
}

export async function setDiscordUserState(
    userDiscordId: bigint,
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
                doc.discordId = doc.discordId || BigInt(0)
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

export async function checkLoggedIn( userDiscordId: bigint ): Promise<[ boolean, string ]> {
    // 
    // Returns the users login status and lastLogin Date in string form
    // Creates a new user if one does not exist
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

export async function getOreIdUser( userDiscordId: bigint): Promise<string> {
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

export async function zeroBotBalance ( userDiscordId: bigint ): Promise<boolean> {
    // 
    // Sets a user's bot balance back to zero, used when creating a new user.
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

export async function updateBotBalance( userDiscordId: bigint, botBalance: number ): Promise<boolean> {
    // 
    // Update the Botbalance of a user in mongodb
    // 
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

export async function addLogEntry( entry: UserLog ): Promise<boolean> {
    // 
    // Adds a log entry to the User's log
    // 
    let saveStatus: boolean = false
    await connect(uri)
    try {        
        await UserLogModel.create(entry)
        saveStatus = true
    }
    catch (err) {
        errorHandler("addLog Entry Failed: ", err)
    }
    await disconnect()
    return saveStatus
}

export async function getLogEntries( discordId: bigint ): Promise<UserLog[]> {
    // 
    // Fetches a UserLog list
    // 
    let logEntries: UserLog[] = []
    await connect(uri)
    try {        
        await UserLogModel.find({"discordId": discordId}).exec().then( async function(docs) {
            for (let doc in docs) {
                // logHandler.info(docs[doc])
                logEntries.push(docs[doc])
            }
        })
    }
    catch (err) {
        errorHandler("addLog Entry Failed: ", err)
    }
    await disconnect()
    return logEntries
}