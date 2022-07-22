import { connect, disconnect, model } from 'mongoose'

import { debugLogger, errorLogger } from '../utils/logHandler'
import { UserLog } from '../interfaces/DiscordUser'
import { DiscordUserModel, UserLogModel, BotBalanceModel} from '../models/DiscordUserModel'
import { addLogEntry } from "./activityLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"
import { mongoUri } from 'utils/mongo'


export async function verifyLogin(
    userOreId: string,
    stateIn: string): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let loggedIn = false
    await connect(mongoUri)
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
                await addLogEntry('Login', doc.discordId, logArgs)
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
                        await addLogEntry('Login', doc?.discordId, logArgs)
                    }
                    else {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "Cannot verify discordID, This may be the users first time logging in."
                        } 
                        await addLogEntry('Login', BigInt(0), logArgs)
                    }
                })
            }
        })
    }
    catch (err) {
        errorLogger("verifyLogin", err)
    }
    await disconnect()
    return loggedIn
}

export async function updateBotBalance( userDiscordId: bigint, botBalance: number ): Promise<boolean> {
    // 
    // Update the Botbalance of a user in mongodb
    // 
    let saveStatus: boolean = false
    await connect(mongoUri)
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
        errorLogger("updateBotBalance", err)
    }
    await disconnect()
    return saveStatus
}

export async function verifySign(
    userOreId: string,
    stateIn: string): Promise<boolean> {
    //
    // Validate a user's login
    // Returns true if the user was logged in correctly
    //
    let signed = false
    await connect(mongoUri)
    try {
        // Declare the DiscordUser model and search mongodb for
        // a state that matches the callback value
        const findUser = await DiscordUserModel.findOne({ "state": String(stateIn) })
        .exec().then(async function(doc) {
            // If the doc exists, set the loggedIn value to true
            // Reset the state to "None"
            if (doc) {
                doc.loggedIn = true
                doc.oreId = userOreId
                doc.state = "None"
                signed = true

                let saveUser = await doc.save()

                // increment the users bot balance
                await BotBalanceModel.findOne({"discordId": doc.discordId}).exec().then( async function(balanceDoc){
                    if (balanceDoc) {
                        balanceDoc.botBalance = balanceDoc.botBalance + (doc.pendingTransaction  || 0.00)
                        await balanceDoc.save()
                    }
                })

                const logArgs: UserLogKWArgs = { 
                    oreId: userOreId,
                    status: "Complete"
                } 
                await addLogEntry('Transfer', doc.discordId, logArgs)
            }
            else {
                const findUser = await DiscordUserModel.findOne({ "oreId": userOreId })
                .exec().then(async function(doc) {
                    if (doc?.discordId) {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "User needs to request new /transfer"
                        } 
                        await addLogEntry('Login', doc?.discordId, logArgs)
                    }
                    else {
                        const logArgs: UserLogKWArgs = {
                            oreId: userOreId,
                            status: "Failed",
                            comment: "Cannot verify discordID, This may be the users first time logging in."
                        } 
                        await addLogEntry('Login', BigInt(0), logArgs)
                    }
                })
            }
        })
    }
    catch (err) {
        errorLogger("verifySign", err)
    }
    await disconnect()
    return signed
}