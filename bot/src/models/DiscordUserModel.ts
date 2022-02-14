import { Schema, model } from "mongoose"
import { DiscordUser, BotBalance } from "../interfaces/DiscordUser"

// 
// User's Discord info
// 
export const discordSchema = new Schema<DiscordUser>({
    dateCreated: {type: Date, required: false },
    discordId: { type: Number, required: true, index: true },
    lastLogin: {type: Date, required: false },
    loggedIn: {type: Boolean, required: true },
    oreId: { type: String, required: false },
    state: { type: String, required: false, ref: 'state'}
})

export const DiscordUserModel = model<DiscordUser>('DiscordUser', discordSchema)

//  
// User's balance on the bot application
// 
export const botBalanceSchema = new Schema<BotBalance>({
    discordId: { type: Number, required: true, index: true },
    botToken: { type: String, required: true , default: process.env.CURRENCY_TOKEN},
    botBalance: { type: Number, required: true },
})

export const BotBalanceModel = model<BotBalance>('BotBalance', botBalanceSchema)