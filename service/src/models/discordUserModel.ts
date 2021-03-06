import mongoose, { Schema, model } from "mongoose"
import mongooseLong from 'mongoose-long'

import { BotBalance, DiscordUser, UserLog } from "../interfaces/DiscordUser"

mongooseLong(mongoose)

// 
// Discord User's info
// 
export const discordSchema = new Schema<DiscordUser>({
    dateCreated: {type: Date, required: false },
    discordId: { type: Schema.Types.Long, required: true , index: true},
    lastLogin: {type: Date, required: false },
    loggedIn: {type: Boolean, required: true },
    oreId: { type: String, required: false },
    state: { type: String, required: false, ref: 'state'},
    pendingTransaction: { type: Number, required: false} 
})

export const DiscordUserModel = model<DiscordUser>('DiscordUser', discordSchema)

//  
// User's balance on the bot application
// 
export const botBalanceSchema = new Schema<BotBalance>({
    discordId: { type: Schema.Types.Long, required: true, index: true },
    botToken: { type: String, required: true , default: process.env.CURRENCY_TOKEN},
    botBalance: { type: Number, required: true },

})

export const BotBalanceModel = model<BotBalance>('BotBalance', botBalanceSchema)

// 
// Logging a user's actions
// 
export const userLogSchema = new Schema<UserLog>({
    // id: { type: Number, required: false, index: true, unique: true, ref: "id" },
    action: { type: String, required: true },
    status: { type: String, required: false },
    amount: { type: Number, required: false },
    date: { type: Date, required: true },
    ip: { type: String, required: false },
    discordId: { type: Schema.Types.Long, required: true },
    oreId: { type: String, required: false },
    recipient: { type: Schema.Types.Long, required: false },
    txnId: { type: String, required: false },
    comment: { type: String, required: false }
})

export const UserLogModel = model<UserLog>('UserLog', userLogSchema)