import { connect, disconnect } from 'mongoose'

import { DiscordUser, UserLog } from '../interfaces/DiscordUser'
import { DiscordUserModel, BotBalanceModel, UserLogModel } from '../models/DiscordUserModel'
import { PriceDataModel } from '../models/PriceDataModel'
import { errorHandler } from '../utils/errorHandler'
import { logHandler } from '../utils/logHandler'
import { PriceData, Price } from '../interfaces/PriceData'
import { User } from '@sentry/node'


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
    userLoggedIn?: boolean,
    pendingTransaction?: number
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
        doc.pendingTransaction = pendingTransaction || doc.pendingTransaction
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
    loggedIn?: boolean,
    pendingTransaction?: number): Promise<boolean> {
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
                if ( pendingTransaction ) {
                    doc.pendingTransaction = pendingTransaction
                }
                else {
                    doc.pendingTransaction = 0.00
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

            if (doc.lastLogin) {
                lastLogin = doc.lastLogin.toString() || "Never"
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

// export function compareLogEntries( userLog: UserLog[]): UserLog[] {
//     // 
//     // Remove duplicate entries from the userLog.
//     // 
//     const uniqueLogEntries = userLog.filter( function(elem, index, self ) {
//         index === self.indexOf(elem);
//         logHandler.info("index: " + index)
//         for (let element of index) {

//         }
//         return self
//     })
//     return uniqueLogEntries
// }

export async function getLogEntries( discordId: bigint ): Promise<UserLog[]> {
    // 
    // Fetches a UserLog list, including activity as a receiver
    // Filters for unique entries (as to not have entries duplicated
    // when the user is both a sender and receiver/a tranfser)
    // 
    let logEntries: UserLog[] = []
    await connect(uri)
    try {        
        await UserLogModel.find({"discordId": discordId}).exec().then( async function(docs) {
            for (let doc in docs) {
                logEntries.push(docs[doc])
            }
        })
        await UserLogModel.find({"recipient": discordId}).exec().then( async function(docs) {
            for (let doc in docs) {
                logEntries.push(docs[doc])
            }
        })
        // logEntries = compareLogEntries( logEntries )
    }
    catch (err) {
        errorHandler("addLog Entry Failed: ", err)
    }
    await disconnect()
    return logEntries
}
 
export async function getLatestEntry(): Promise<PriceData> {
    let latestEntry: PriceData = new PriceDataModel
    await connect(uri)
    try {
        await PriceDataModel.findOne().sort('-dateCreated').exec().then(function(item) {
            if (item) {
                latestEntry = item
            }
        })
        logHandler.info('latestEntry: ' + JSON.stringify(latestEntry))
    }
    catch (err) {
        errorHandler('getLatestEntry in mongo.ts', err)
    }
    await disconnect()
    return latestEntry
}

export async function createPriceEntry( apiData: Price ): Promise<PriceData> {
    let priceData: PriceData = new PriceDataModel
    await connect(uri)
    try {
        priceData = {
            dateCreated: apiData.dateCreated,
            priceUSD: apiData.priceUSD,
            priceBTC: 0,
            volumeBTC: 0,
            volumeETH: 0,
            volumeORE: 0,
            volumeUSD: apiData.volumeUSD,
            priceChange24h: apiData.priceChange24h
        }
        await PriceDataModel.create(priceData)
    }
    catch (err) {
        errorHandler('createPriceEntry', err)
    }
    await disconnect()
    return priceData
}