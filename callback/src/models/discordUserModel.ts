import { Schema, model } from "mongoose"
import { DiscordUser } from "interfaces/DiscordUser"

export const discordSchema = new Schema<DiscordUser>({
    dateCreated: {type: Date, required: false },
    discordId: { type: Number, required: true },
    lastLogin: {type: Date, required: false },
    loggedIn: {type: Boolean, required: true },
    oreId: { type: String, required: false },
    state: { type: String, required: false, ref: 'state'}
    })

export const DiscordUserModel = model<DiscordUser>('DiscordUserUser', discordSchema)