import { connect, disconnect, model } from 'mongoose'
import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { UserLog } from '../interfaces/DiscordUser'
import { DiscordUserModel, UserLogModel } from '../models/DiscordUserModel'
import { logEntry } from "./userLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"

const uri = process.env.MONGO_URI || "mongodb://" 
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
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        const findUser = await DiscordUserModel.findOne({ "state": String(stateIn) })
        .exec().then(async function(doc) {
            // If the doc exists, set the loggedIn value to true
            // Reset the state to "None"
            if (doc) {
                doc.loggedIn = true
                doc.lastLogin = new Date
                doc.oreId = userOreId
                doc.state = "None"
                loggedIn = true

                let saveUser = await doc.save()

                const logArgs: UserLogKWArgs = { 
                    oreId: userOreId,
                    status: "Complete"
                } 
                await logEntry('Login', doc.discordId, logArgs)
            }
            else {
                const findUser = await DiscordUserModel.findOne({ "oreId": userOreId })
                .exec().then(async function(doc) {
                    if (doc?.discordId) {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "User needs to request new /login"
                        } 
                        await logEntry('Login', doc?.discordId, logArgs)
                    }
                    else {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "Cannot verify discordID, This may be the users first time logging in."
                        } 
                        await logEntry('Login', BigInt(0), logArgs)
                    }
                })
            }
        })
    }
    catch (err) {
        logHandler.error("Error verifying login: " + err)
    }
    await disconnect()
    return loggedIn
}

export async function verifyLogout( stateIn: string ): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let logoutSuccess: boolean = false
    await connect(uri)
    // Connect to mongoDB
    logHandler.info('Connected to MongoDB!')
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        logHandler.info("Finding: " + stateIn)
        // const OreIdUser = model('OreIdUser', discordSchema)
        const findUser = await DiscordUserModel.findOne({ "state": String(stateIn) })
        .exec().then(async function(doc) {
            logHandler.info('document fetched: ' + doc)
            // If the doc exists, set the loggedIn value to false
            // Also reset the state to "None"
            if (doc) {
                doc.loggedIn = false
                doc.oreId = "None"
                doc.state = "None"
                logoutSuccess = true

                let saveUser = await doc.save()
                logHandler.info('Saved the doc to mongodb: ' + saveUser)

                const logArgs: UserLogKWArgs = { 
                    status: "Complete"
                } 
                await logEntry('LogOut', doc.discordId, logArgs)
            }
            else {
                const logArgs: UserLogKWArgs = {
                    status: "Failed",
                    comment: "Cannot verify discordID."
                } 
                await logEntry('LogOut', BigInt(0), logArgs)
                logHandler.error('verifyLogout failed')
            }
        })
    }
    catch (error) {
        logHandler.error("Error verifying logout: " + error)
    }
    await disconnect()
    return logoutSuccess
}

export async function addLogEntry( entry: UserLog ): Promise<boolean> {
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
