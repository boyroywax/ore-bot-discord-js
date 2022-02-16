import { Schema, model } from "mongoose"
import { DiscordUser, UserLog } from "../interfaces/DiscordUser"

// 
// Discord User's info
// 
export const discordSchema = new Schema<DiscordUser>({
    dateCreated: {type: Date, required: false },
    discordId: { type: Number, required: true , index: true},
    lastLogin: {type: Date, required: false },
    loggedIn: {type: Boolean, required: true },
    oreId: { type: String, required: false },
    state: { type: String, required: false, ref: 'state'}
})

export const DiscordUserModel = model<DiscordUser>('DiscordUser', discordSchema)

// 
// Logging a user's actions
// 
export const userLogSchema = new Schema<UserLog>({
    id: { type: Number, required: false, index: true, default: 0, unique: true, ref: "id" },
    action: { type: String, required: true },
    stage: { type: String, required: false },
    amount: { type: Number, required: false },
    date: {type: Date, required: true },
    discordId: { type: Number, required: true },
    oreId: { type: String, required: false },
    recipient: { type: Number, required: false },
    txnId: { type: String, required: false },
    comment: { type: String, required: false }
})

export const UserLogModel = model<UserLog>('UserLog', userLogSchema)